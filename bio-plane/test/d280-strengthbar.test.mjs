/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d280-strengthbar.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (`severedhomes.control.mjs`'s precedent, PL-13's `current.control.mjs` before it). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad (PL-10). Every arm is armed ALONE with every other defence held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a per-arm pristine copy named with the ARM ID as well as the path, and every arm DECLARES before it runs what MUST fail and what MUST NOT.
   (A) THE DRIVEN SITE'S CONFIRMATION, REVERTED. In src/store.mjs #requiredStrengthFor delete the `if (kinds.every((k) => this.#refEdgeSevered(citerId, bundleId, k || null))) continue;` line -> D-280's defect exactly: a project whose ONLY citing relation is `status: severed` sets the publication bar on the document it left. MUST FAIL: §2's headline bar arm and §2's strictest-per-axis arm (the withdrawn project's STRICTER bar binds again and its id is named in `projects`). MUST NOT FAIL: every over-strictness arm in §3, §5's routing arms, §6's restson arms — which is what makes this arm measure the bar read and not the predicate.
   (B) THE ROUTING SITE'S CONFIRMATION, REVERTED. In src/store.mjs #routeTask replace the `find` over `citeEdges` with `[...citeEdges][0]` -> the obligation is addressed to the owner of a project that WITHDREW. MUST FAIL: §5's routing arm. MUST NOT FAIL: §2, §3, §6 — armed apart from (A) on purpose, because one confirmation covering for another is exactly how a half-fix reads as a whole one.
   (C) OVER-STRICTNESS, AND IT IS THE ARM THIS ITEM EXISTS FOR. In src/store.mjs #requiredStrengthFor replace the confirmation with `if (kinds.some((k) => this.#refEdgeSevered(citerId, bundleId, k || null))) continue;` — ANY severed edge withdraws the citer instead of ALL. This is the plausible, well-meant version and it is the direction that silently drops a bar somebody still means. MUST FAIL: §3's other-relation arm. MUST NOT FAIL: §2's headline (a fence tighter than its rule still refuses the case it was built for, which is why over-strictness needs its own arm and cannot be read off the headline).
   (C2) OVER-STRICTNESS, THE PREDICATE'S OWN CONSERVATIVE ARM SEEN THROUGH THIS OP. In src/store.mjs #refEdgeSevered compare `String(entry.status ?? "").trim().toLowerCase()` instead of the raw value, AND make the absent-entry branch `return !entry || …` -> `Severed`, `severed ` and a reference with NO `status:` key all become withdrawals. MUST FAIL: §3's no-status, capitalised and padded arms. MUST NOT FAIL: §2, so the arm measures the fence's WIDTH and not the fixtures.
   (D) THE PROJECTION READ, REVERTED. In src/store.mjs restingOn delete the `.map(...)` that attaches `status` -> the read is status-blind again. MUST FAIL: §6's two restson arms. MUST NOT FAIL: anything else.
   (E) THE SHARED PREDICATE IS SHARED. In src/store.mjs #requiredStrengthFor replace the `#refEdgeSevered` call with an inline re-read of the citing document's `references[]` — a FAITHFUL COPY, identical in behaviour -> the rule has two implementations again. MUST FAIL: §7's structural arm, which counts the call sites off the source. MUST NOT FAIL: any behavioural arm, WHICH IS THE WHOLE POINT: D-267 exists because a rule with four inline implementations grew a fifth reader that did not know the rule existed, and no behavioural arm anywhere can see a faithful copy.
   (F) OVER-STRICTNESS, and these PASS rather than fail: a live citing project still sets the bar and is still NAMED; a reference with NO `status:` key is live; a `status:` value the catalog does not write is live; the RIGHT word with trailing whitespace is live; a project whose `relates_to` is severed while its `cites` is confirmed is live; a withdrawn project is STILL REACHABLE by `op=backlinks`, which names it and reports the edge as `severed`; and `restson` still LISTS the withdrawn leg rather than dropping it. A fence that refuses correct work is a defect in the fence, and a read that forgot an edge existed is worse than one that kept it.
   (G) BASELINE. Every arm restored, suite re-run, full green.
   ==== RUN 2026-08-10, record-d280. 6 arms, 0 NOT AS DECLARED, 0 restore failures, driver exit 0. Baseline 29/0 here and 14/0 in severedhomes; `src/store.mjs` 1,653,120 bytes restored after EVERY arm, verified by sha256, by CONTENT and by `cmp` twice (per-arm pristine AND pristine-of-record). MEASURED: (A) 22/7 here + 13/1 there — the headline, the standing-sentence arm, the leak arm, the strictest-per-axis arm and the group-fallback arm all come down, and the over-strictness, routing and restson arms all stay GREEN, which is what says this arm measures the bar read and not the predicate; (B) 26/3 + 13/1 — routing and its basis arm only; (C) 28/1 + **14/0**, the ONLY arm that leaves D-267's suite untouched, and the one failure is the other-relation arm with the HEADLINE STILL GREEN, which is the whole argument for a separate over-strictness arm; (C2) 26/3 + 13/1 — the three spelling arms here AND D-267's own over-strictness arm, because the predicate is shared and an arm that widened it while reporting one suite would report half of what it did; (D) 27/2 + 13/1; (E) 27/2 + 13/1 — the structural arms in BOTH suites and NOT ONE behavioural arm anywhere, which is the point: a faithful copy is invisible to behaviour. **THREE DECLARATIONS CAME BACK WRONG ON THE FIRST RUN AND THE ARMS WERE RIGHT** — (A), (B) and (D) each delete a call site and each had declared `severedhomes` wholly green, which is impossible: D-267's caller pin is EXACT and this item corrected it from three to six. The declarations were corrected and the correction is recorded in the driver's header rather than the paragraph being rewritten.
 * ========================================================================= */
/* D-280 — **A PROJECT THAT WITHDREW DOES NOT SET THE PUBLICATION BAR ON THE
 * DOCUMENT IT LEFT**, driven through `op=strengthbarof` and not asserted at the
 * store.
 *
 * ---- WHAT WAS WRONG, in one sentence the fix has to answer
 *
 * `refs` is a projection of a document's `references[]` that carries the
 * RELATION and DROPS the STATUS (D-21, D-267). `#requiredStrengthFor` read that
 * projection and nothing else, so a project that authored `status: severed` —
 * the recorded decision to stop drawing on a question — kept its row and kept
 * declaring the required evidentiary strength for the document it had left.
 * `op=strengthbarof` answered `declared: true, source: "project", projects:
 * ["PROJ-…-withdrawn"]`, and `op=publish` stamped that same read into SIGNED
 * bytes. D-280's row censused fifteen reverse-edge reads over `refs` /
 * `inquiry_basis` and named this one the strongest of the six that did not
 * confirm: DRIVEN, and on a fence.
 *
 * ---- WHY THE PREDICATE IS CONSUMED AND NOT RESTATED
 *
 * `#refEdgeSevered` is D-267's ONE severance predicate and this item adds no
 * second one. A rule with several inline implementations is this repository's
 * most-repeated defect and has already absorbed a control here — which is why
 * §7 counts the call sites off the source, and why arm (E) exists: a faithful
 * copy behaves identically and no behavioural arm can see it.
 *
 * ---- WHAT IS ASSERTED, in the order the blocks run
 *
 *  1. THE FIXTURE IS REAL AND NON-EMPTY, and the corpus is PRINTED. A headline
 *     assertion over an empty corpus is how three walks in this estate
 *     congratulated themselves.
 *  2. THE DRIVEN SITE, through `op=strengthbarof`. A document whose ONLY citing
 *     project withdrew answers `declared: false, source: "none"` — and it says
 *     so in the record's own standing sentence rather than going quiet. A
 *     document cited by BOTH a live project at B/B and a withdrawn one at A/A
 *     answers B/B: the strictest-per-axis composition still runs, and it no
 *     longer composes over a declaration nobody stands behind. Then the group
 *     declares a default and the same withdrawn-only document answers
 *     `source: "group"`, which is what a default is.
 *  3. OVER-STRICTNESS, FOUR WAYS, AND IT IS THE POINT OF THE ITEM. Severance
 *     narrows only on a POSITIVE recorded withdrawal: no `status:` key is live,
 *     an unrecognised `status:` value is live, the right word with trailing
 *     whitespace is live, and a severed `relates_to` beside a confirmed `cites`
 *     is live. **A fence tighter than its rule silently withdraws real citers,
 *     which is the same overclaim class pointing the other way.**
 *  4. THE EDGE IS NOT FORGOTTEN, ONLY NOT COUNTED — `op=backlinks` still names
 *     the withdrawn project and still reports `status: severed`. Dropping a bar
 *     is not deleting history.
 *  5. SITE (b), `#routeTask`, DRIVEN THROUGH `op=taskdrain`. The obligation is
 *     no longer addressed to the owner of a project that withdrew. The DEBT row
 *     reported this site READ BUT NOT DRIVEN because ownership could not be
 *     established on a machine-promoted project through the ops; it is driven
 *     here through the Durable Object's `projectclaimowner` surface, which
 *     `projects.test.mjs` has used since 7.1 landed. **The row's obstacle was
 *     real and is now cleared rather than restated.**
 *  6. SITE (d), `restingOn`, DRIVEN ON THE DURABLE OBJECT'S OWN FETCH SURFACE
 *     AND SAID TO BE. `restson` is NOT a control-plane op — measured, not
 *     assumed: `grep -n restson src/index.mjs` is empty — so this is the one
 *     block here that no member-facing caller can reach, and its reach is
 *     stated rather than dressed up as an op test.
 *  7. THE STRUCTURAL ARM: one implementation, six callers, counted off the
 *     source. Plus the two sites this item did NOT change, PINNED so the
 *     judgement is enforced rather than merely written down.
 *
 * ---- WHAT THIS SUITE CANNOT SEE, stated plainly
 *
 *   IT CANNOT reach `#refEdgeSevered`'s UNREADABLE branch through any op: every
 *     bundle it promotes has a readable `bundle.md`, and no op leaves a bundle
 *     row with its document gone. Inherited from D-267's suite, which recorded
 *     the same gap rather than claiming coverage it did not have.
 *   IT CANNOT drive `op=sever` onto a project→document edge, because that door
 *     does not exist (REC-72, measured by D-216 and confirmed by PL-13): the
 *     severance is HAND-AUTHORED into `references[]` and promoted. Every arm
 *     here is about what the plane DOES with a severed edge; none of them says
 *     a member can make one through an act.
 *   IT CANNOT drive site (e), `#leadBasisAbsence`. Reaching it needs the whole
 *     capture-request / AI-run / project-participation machinery
 *     (`leadslug.test.mjs`'s fixture), which is disproportionate to a site this
 *     item deliberately leaves unchanged. §7 pins the judgement STRUCTURALLY
 *     instead, and the argument for leaving it alone is in the DEBT row and in
 *     this item's report — NAMED, not silently skipped.
 *   IT CANNOT see a second isolate. One store, one Durable Object.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const INDEX_SRC = readFileSync(IDX, "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: INDEX_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* The automatic drain is pushed far out so the manual drains below are never
     raced by the alarm — severedhomes' precedent, queue.test.mjs's before it. */
  bindings: { ADMIN_TOKEN: "adm-d280", MEMBER_TOKEN: "mem-d280", PROBE_TOKEN: "prb-d280",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
/* NULL-TOLERANT DEEP READ (PL-1's discipline, leadslug's receipt). When an op
   refuses — which is exactly what the control harness arms — the answer carries
   no `bar` at all, so every `…bar.source` below would throw and every arm
   BEHIND the throw would report nothing. An arm whose "must not fail" clauses
   were never evaluated proved less than it claimed. */
const g = (o, path) => path.split(".").reduce((a, k) => (a === null || a === undefined ? null : a[k]), o);

/* The literals `op=strengthbarof`, `op=backlinks`, `op=taskdrain` and
   `op=strengthbar` are written out rather than interpolated so
   scripts/coverage.mjs credits the ops as REACHED — D-43: a store-level test is
   not evidence a caller can get there, and `op=invitelook` shipped with a
   ReferenceError while 1276 store-level assertions passed. */
const barOf = async (tok, target) =>
  await GET(`op=strengthbarof&token=${tok}&target=${encodeURIComponent(target)}`);
const backlinksOf = async (tok, target) =>
  await GET(`op=backlinks&token=${tok}&target=${encodeURIComponent(target)}`);

const NOW = "2026-08-10T12:00:00Z";
const MACHINE = "mem-d280";

/* ---------------------------------------------------------------- documents
   `status` is a PARAMETER of the reference line and never a fixed literal,
   because half of what this suite measures is what the predicate does with a
   status it was not written for. `undefined` emits NO `status:` key at all. */
const refLine = (x) => [`  - target: ${x.target}`, `    rel: ${x.rel ?? "cites"}`,
  ...(x.status === undefined ? [] : [`    status: ${x.status}`])];
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap(refLine)] : ["references: []"];
const legLines = (targets) => targets.length
  ? ["basis:", ...targets.flatMap((x) => [`  - target: ${x}`, "    role: supports",
      "    grade: B", "    grade_axis: connection", "    grade_source: hunch",
      "    author: suite", "    date: 2026-08-10"])]
  : [];

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Doc ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const inquiryMd = (id, question, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "", "## Question", "", question, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${NOW} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

/* THE BAR IS AUTHORED FRONTMATTER AND NOT A TABLE (DEC-17): a group may lower
   its own bar and may not do it quietly, so a project's declaration is an
   authored, dated, promoted, append-only act. `bar` is a PARAMETER here for the
   same reason `status` is: a project citing without declaring one must not
   contribute, and that has to be a fixture the suite can build. */
const projectMd = (id, refs, bar = null) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Project ${id}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."',
  ...(bar ? ["required_strength:", `  capture: ${bar.capture}`, `  connection: ${bar.connection}`,
             `  author: ${bar.author}`, `  at: "${bar.at}"`] : []),
  "---", "", "## Thesis Summary", "", "A project.", "",
  "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, state, register = []) => {
  const r = await POST(`op=promote&token=${MACHINE}`, {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "d280-suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: NOW } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 900)}`);
  return r;
};

const member = async (id, caps, role = "member") => {
  const add = await POST("op=memberadd&token=adm-d280",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};

try {

const stub = await mf.getDurableObjectNamespace("STORE");
const obj = stub.get(stub.idFromName("bio"));
const doPost = async (op, body) => rP(await (await obj.fetch(`http://x/${op}`,
  { method: "POST", body: JSON.stringify(body) })).json());
const doGet = async (op, qs) => rP(await (await obj.fetch(`http://x/${op}?${qs}`)).json());

/* ====================================================================== 1
 * THE FIXTURE, AND ITS CORPUS PRINTED.
 * ===================================================================== */
console.log("\n--- 1. the fixture: every subject a real document, every citer a real promoted project ---");

const NADIA = await member("nadia", ["contribute", "publish", "create_projects"], "admin");
/* A SECOND ADMINISTRATOR before any ordinary member: administrative access is
   shared so losing one person does not lose the group, and the roster refuses
   the second member otherwise (leadslug's receipt). */
await member("gus", ["contribute"], "admin");
const CAROL = await member("carol", ["contribute", "create_projects"]);
const DAVE = await member("dave", ["contribute", "create_projects"]);

/* The SUBJECTS, one per question this suite asks. */
const SUBJ_LIVE = "INFO-2026-9201-live-citer";
const SUBJ_WITHDRAWN_ONLY = "INFO-2026-9202-withdrawn-only";
const SUBJ_MIXED = "INFO-2026-9203-live-and-withdrawn";
const SUBJ_NOSTATUS = "INFO-2026-9204-no-status-key";
const SUBJ_ODDSTATUS = "INFO-2026-9205-unrecognised-status";
const SUBJ_PADSTATUS = "INFO-2026-9206-padded-status";
const SUBJ_OTHERREL = "INFO-2026-9207-other-relation-severed";
const SUBJ_ROUTING = "INFO-2026-9208-routing";
const SUBJ_RESTING = "INFO-2026-9209-rested-on";
/* SUBJ_ROUTING is DELIBERATELY NOT PROMOTED HERE. §5 promotes it with the
   REGISTER entry that attaches the queued capture to it, which is the act that
   mints the obligation — promoting it empty first would take the id and §5's
   real promotion would then be refused `EXISTS`. */
const SUBJECTS = [SUBJ_LIVE, SUBJ_WITHDRAWN_ONLY, SUBJ_MIXED, SUBJ_NOSTATUS, SUBJ_ODDSTATUS,
                  SUBJ_PADSTATUS, SUBJ_OTHERREL, SUBJ_RESTING];
for (const s of SUBJECTS) await promote(s, infoMd(s), "information", "collected");

/* THE BARS. `A` is STRICTER than `B` — BASIS_GRADES is strongest-first and
   `#requiredStrengthFor` takes the lowest index PER AXIS. The withdrawn
   projects declare the STRICTER bar on purpose: if a withdrawn declaration
   still bound, §2's composition arm would report A and not B, and that is the
   sharpest single observation in this suite. */
const STRICT = { capture: "A", connection: "A", author: "nadia", at: "2026-08-01T00:00:00Z" };
const LOOSE = { capture: "B", connection: "B", author: "nadia", at: "2026-08-01T00:00:00Z" };

const P_LIVE = "PROJ-2026-9201-still-citing";
const P_WITHDRAWN = "PROJ-2026-9202-withdrawn";
const P_MIXED_LIVE = "PROJ-2026-9203-mixed-live";
const P_MIXED_GONE = "PROJ-2026-9204-mixed-withdrawn";
const P_NOSTATUS = "PROJ-2026-9205-no-status-key";
const P_ODDSTATUS = "PROJ-2026-9206-unrecognised-status";
const P_PADSTATUS = "PROJ-2026-9207-padded-status";
const P_OTHERREL = "PROJ-2026-9208-other-relation-severed";

await promote(P_LIVE, projectMd(P_LIVE, [{ target: SUBJ_LIVE, status: "confirmed" }], LOOSE),
  "project", "forming");
await promote(P_WITHDRAWN, projectMd(P_WITHDRAWN,
  [{ target: SUBJ_WITHDRAWN_ONLY, status: "severed" }], STRICT), "project", "forming");
await promote(P_MIXED_LIVE, projectMd(P_MIXED_LIVE, [{ target: SUBJ_MIXED, status: "confirmed" }], LOOSE),
  "project", "forming");
await promote(P_MIXED_GONE, projectMd(P_MIXED_GONE, [{ target: SUBJ_MIXED, status: "severed" }], STRICT),
  "project", "forming");

/* §3 — THE SPELLINGS THIS ITEM DID NOT ANTICIPATE, every one of them LIVE, and
   every one of them declaring the STRICT bar so a wrongly-withdrawn citer is
   visible as a MISSING bar rather than as a changed letter. */
await promote(P_NOSTATUS, projectMd(P_NOSTATUS, [{ target: SUBJ_NOSTATUS, status: undefined }], STRICT),
  "project", "forming");
await promote(P_ODDSTATUS, projectMd(P_ODDSTATUS, [{ target: SUBJ_ODDSTATUS, status: "Severed" }], STRICT),
  "project", "forming");
await promote(P_PADSTATUS, projectMd(P_PADSTATUS, [{ target: SUBJ_PADSTATUS, status: '"severed "' }], STRICT),
  "project", "forming");
/* THE OR ACROSS EDGE KINDS, and it is the arm that separates ALL-severed from
   ANY-severed. One project, two relations to one target: the `relates_to` is
   withdrawn and the `cites` is not. Withdrawing a `relates_to` is not
   withdrawing a citation. */
await promote(P_OTHERREL, projectMd(P_OTHERREL,
  [{ target: SUBJ_OTHERREL, rel: "relates_to", status: "severed" },
   { target: SUBJ_OTHERREL, rel: "cites", status: "confirmed" }], STRICT), "project", "forming");

const PROJECTS = [P_LIVE, P_WITHDRAWN, P_MIXED_LIVE, P_MIXED_GONE, P_NOSTATUS, P_ODDSTATUS,
                  P_PADSTATUS, P_OTHERREL];
console.log(`  CORPUS: ${SUBJECTS.length} subject document(s), ${PROJECTS.length} citing project(s), `
  + `every one promoted through op=promote and readable back through op=image`);
t("FIXTURE GUARD: every subject and every citer really landed — the corpus is non-empty and the "
+ "count is asserted, because an assertion over a corpus that minted nothing passes for free",
  [(await GET(`op=list&token=${MACHINE}`)).filter((b) =>
      SUBJECTS.includes(b.bundle_id) || PROJECTS.includes(b.bundle_id)).length],
  [SUBJECTS.length + PROJECTS.length]);
t("FIXTURE GUARD: the withdrawal is really IN the promoted document — `status: severed` survived "
+ "promotion, so §2's headline is measuring a severed edge and not a missing one",
  /rel: cites\n\s+status: severed/.test(
    (await GET(`op=image&token=${MACHINE}&id=${encodeURIComponent(P_WITHDRAWN)}`))?.["bundle.md"] ?? ""),
  true);

/* ====================================================================== 2
 * THE DRIVEN SITE — op=strengthbarof.
 * ===================================================================== */
console.log("\n--- 2. op=strengthbarof: a project that withdrew does not set the bar ---");
{
  /* THE MUST-NOT-FAIL COMPLEMENT FIRST, so the headline below cannot be read as
     "the bar read broke". A project that still cites still declares. */
  const live = await barOf(MACHINE, SUBJ_LIVE);
  t("a project that STILL CITES sets the bar and is NAMED — unchanged, and asserted first so the "
  + "headline cannot be satisfied by a bar read that simply stopped working",
    [g(live, "bar.declared"), g(live, "bar.source"), g(live, "bar.capture"),
     g(live, "bar.connection"), g(live, "bar.projects")],
    [true, "project", "B", "B", [P_LIVE]]);

  /* THE HEADLINE. No group default is declared yet, so the honest answer for a
     document whose only citer withdrew is that NOBODY declares a bar for it. */
  const gone = await barOf(MACHINE, SUBJ_WITHDRAWN_ONLY);
  t("THE DEFECT, DRIVEN: a document whose ONLY citing project authored `status: severed` no longer "
  + "answers `declared: true, source: project` — the project that withdrew does not set the bar on "
  + "the document it left",
    [g(gone, "bar.declared"), g(gone, "bar.source"), g(gone, "bar.capture"),
     g(gone, "bar.connection"), g(gone, "bar.projects")],
    [false, "none", null, null, null]);
  t("and it does NOT go quiet about it: an absent bar is STATED in the record's own standing "
  + "sentence, so a fence that loosened says that it loosened",
    [String(g(gone, "bar.detail")).includes("not a bar of zero"),
     String(g(gone, "bar.detail")).includes("makes no claim to have cleared any standard")],
    [true, true]);
  t("the withdrawn project is not named ANYWHERE in the answer — not in `projects` and not "
  + "interpolated into the prose, which is REC-30's leak shape and would republish the id by the "
  + "back door even while the bar itself was dropped",
    JSON.stringify(gone).includes(P_WITHDRAWN), false);

  /* THE SHARPEST OBSERVATION IN THE SUITE. Both projects cite; one withdrew;
     the withdrawn one declares the STRICTER bar. Strictest-per-axis still runs
     and now runs over the declarations that are still standing. */
  const mixed = await barOf(MACHINE, SUBJ_MIXED);
  t("STRICTEST-PER-AXIS STILL COMPOSES, AND NO LONGER COMPOSES OVER A WITHDRAWAL: a document cited "
  + "live at B/B and severed at A/A answers B/B and names only the project still standing behind "
  + "it — a withdrawn declaration cannot tighten a bar any more than it can set one",
    [g(mixed, "bar.source"), g(mixed, "bar.capture"), g(mixed, "bar.connection"),
     g(mixed, "bar.projects")],
    ["project", "B", "B", [P_MIXED_LIVE]]);

  /* THE GROUP DEFAULT, DECLARED THROUGH THE ACT. `op=strengthbar` refuses a
     machine credential (DEC-49 / REC-64), so this is nadia's act and not the
     suite's — the same reason the fixture enrols members at all. */
  const set = await POST(`op=strengthbar&token=${NADIA}`, { capture: "C", connection: "C" });
  t("the GROUP declares its default through op=strengthbar, carrying its author",
    [set.ok, set.capture, set.connection, set.author], [true, "C", "C", "nadia"]);
  const fallback = await barOf(MACHINE, SUBJ_WITHDRAWN_ONLY);
  t("AND NOW THE SAME DOCUMENT TAKES THE GROUP DEFAULT — which is what a default IS. Dropping a "
  + "withdrawn project's declaration does not delete the group's own standard; it stops one "
  + "project's abandoned override standing in front of it",
    [g(fallback, "bar.declared"), g(fallback, "bar.source"), g(fallback, "bar.capture")],
    [true, "group", "C"]);
  t("and the LIVE citer's override still beats the group default it is stricter than — the "
  + "override path is intact and this arm is what says so",
    [g(await barOf(MACHINE, SUBJ_LIVE), "bar.source"),
     g(await barOf(MACHINE, SUBJ_LIVE), "bar.capture")], ["project", "B"]);
}

/* ====================================================================== 3
 * OVER-STRICTNESS — THE POINT OF THIS ITEM.
 * ===================================================================== */
console.log("\n--- 3. over-strictness: severance narrows ONLY on a positive recorded withdrawal ---");
{
  const shapes = [
    [SUBJ_NOSTATUS, P_NOSTATUS, "a reference with NO `status:` key at all — the shape most of this "
      + "corpus's documents carry before anybody severs anything"],
    [SUBJ_ODDSTATUS, P_ODDSTATUS, "`status: Severed`, capitalised — a spelling the catalog does not "
      + "write, and not evidence of anything"],
    [SUBJ_PADSTATUS, P_PADSTATUS, "`status: \"severed \"` — the RIGHT word with trailing whitespace, "
      + "and still not a withdrawal: trimming our way into inferring one is the direction that costs "
      + "somebody a bar they never withdrew"],
    [SUBJ_OTHERREL, P_OTHERREL, "a severed `relates_to` beside a CONFIRMED `cites` — ANY live edge "
      + "keeps the citer, which is the OR that separates all-severed from any-severed"],
  ];
  for (const [subject, project, why] of shapes) {
    const b = await barOf(MACHINE, subject);
    t(`LIVE, and the bar stands: ${why}`,
      [g(b, "bar.declared"), g(b, "bar.source"), g(b, "bar.capture"), g(b, "bar.projects")],
      [true, "project", "A", [project]]);
  }
  t("VACUITY GUARD for the four arms above: they read `capture: A`, and the GROUP default is `C` — "
  + "so a fence that wrongly withdrew every one of these citers would fall through to the group "
  + "and be caught, rather than answering the same letter by coincidence",
    (await GET(`op=strengthbarof&token=${MACHINE}&group=believe-in-oakland`)).bar?.capture, "C");
}

/* ====================================================================== 4
 * THE EDGE IS NOT FORGOTTEN, ONLY NOT COUNTED.
 * ===================================================================== */
console.log("\n--- 4. op=backlinks still names the withdrawn project, and still reports it severed ---");
{
  const bl = await backlinksOf(MACHINE, SUBJ_WITHDRAWN_ONLY);
  const entry = (bl?.backlinks ?? []).find((x) => x.from === P_WITHDRAWN);
  t("the withdrawn project is STILL REACHABLE and STILL REPORTED AS SEVERED — dropping a bar is not "
  + "deleting history, and `backlinks` publishing the status is the opposite of this item's defect "
  + "rather than another instance of it",
    [entry != null, entry?.status], [true, "severed"]);
}

/* ====================================================================== 5
 * SITE (b) — #routeTask, DRIVEN THROUGH op=taskdrain.
 * ===================================================================== */
console.log("\n--- 5. #routeTask: an obligation is not addressed to the owner of a project that withdrew ---");
{
  /* TWO citing projects over ONE bundle. The WITHDRAWN one sorts FIRST by id,
     which is the order `#routeTask` reads in — so before the fix the obligation
     went to carol, who withdrew, and the live project's owner never saw it. */
  const P_GONE = "PROJ-2026-9281-withdrawn-router";
  const P_HERE = "PROJ-2026-9282-still-citing-router";
  await promote(P_GONE, projectMd(P_GONE, [{ target: SUBJ_ROUTING, status: "severed" }]),
    "project", "forming");
  await promote(P_HERE, projectMd(P_HERE, [{ target: SUBJ_ROUTING, status: "confirmed" }]),
    "project", "forming");
  /* 7.1 gives ownership to the promoting MEMBER, and these were promoted by a
     machine credential — which is exactly the obstacle D-280's row reported and
     said it could not get past in the time available. The Durable Object's own
     `projectclaimowner` surface is how `projects.test.mjs` has established
     ownership since 7.1 landed, and it is used here for the same reason. */
  const oGone = await doPost("projectclaimowner", { projectId: P_GONE, memberId: "carol" });
  const oHere = await doPost("projectclaimowner", { projectId: P_HERE, memberId: "dave" });
  t("FIXTURE GUARD: both routing projects really have an ACTIVE owner, so this block is measuring "
  + "the citation filter and not a missing participation row",
    [oGone.ok, oGone.owner, oHere.ok, oHere.owner], [true, "carol", true, "dave"]);

  /* A REAL 64-CHAR HEX DIGEST. `d280route` is not hex, and a digest the
     register cannot parse produces no obligation and an arm that reports
     nothing — measured on this suite's first run. */
  const cap = "d2801".padStart(64, "0");
  await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: cap,
    subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: NOW });
  await promote(SUBJ_ROUTING, infoMd(SUBJ_ROUTING), "information", "collected",
    [{ sha256: cap, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }]);
  const drained = await POST(`op=taskdrain&token=${MACHINE}`, { actor: "consumer", now: NOW });
  const made = (drained.created || []).find((c) => c.refers_to === SUBJ_ROUTING);
  t("FIXTURE GUARD: the drain really minted the obligation this arm is about",
    made != null, true);
  t("THE OBLIGATION GOES TO THE OWNER OF A PROJECT THAT IS STILL CITING, PAST THE WITHDRAWN ONE "
  + "THAT SORTS FIRST — D-267's harm one op over, and the DEBT row's un-driven site now driven",
    [made?.assignee, made?.assignee_role], ["dave", "project-manager"]);
  t("and the routing BASIS names the project it actually used, so a member can read why the task "
  + "arrived rather than inferring it",
    String(made?.basis ?? "").includes(P_HERE) && !String(made?.basis ?? "").includes(P_GONE), true);
}

/* ====================================================================== 6
 * SITE (d) — restingOn, ON THE DURABLE OBJECT'S OWN FETCH SURFACE.
 * ===================================================================== */
console.log("\n--- 6. restson: a withdrawn leg is LISTED and CARRIES ITS STATUS, never dropped ---");
{
  t("MEASURED, NOT ASSUMED, AND IT BOUNDS THIS BLOCK'S REACH: `restson` is NOT a control-plane op, "
  + "so no member-facing caller reaches this read and every arm below drives the Durable Object's "
  + "own fetch surface. Stated rather than dressed up as an op test",
    /\brestson\b/.test(INDEX_SRC), false);

  const Q_LIVE = "INQ-2026-9291-still-resting";
  const Q_GONE = "INQ-2026-9292-withdrawn-leg";
  await promote(Q_LIVE, inquiryMd(Q_LIVE, "Does the memo still carry it?",
    { refs: [{ target: SUBJ_RESTING, rel: "relates_to", status: "confirmed" }], legs: [SUBJ_RESTING] }),
    "inquiry", "open");
  await promote(Q_GONE, inquiryMd(Q_GONE, "Did we stop relying on the memo?",
    { refs: [{ target: SUBJ_RESTING, rel: "relates_to", status: "severed" }], legs: [SUBJ_RESTING] }),
    "inquiry", "open");

  const r = rP(await doGet("restson", `id=${encodeURIComponent(SUBJ_RESTING)}`));
  const byId = Object.fromEntries((r?.dependents ?? []).map((d) => [d.bundle_id, d]));
  t("BOTH dependents are still LISTED — the withdrawn leg is not dropped, because this is the "
  + "projection read back and a leg somebody withdrew is a fact the record keeps",
    [(r?.dependents ?? []).length, Object.keys(byId).sort()], [2, [Q_LIVE, Q_GONE].sort()]);
  t("and each one now CARRIES ITS STATUS, so a reader can tell a live leg from a withdrawn one "
  + "without a second read — the blindness D-280 named, closed additively (IC-61)",
    [byId[Q_LIVE]?.status, byId[Q_GONE]?.status], ["confirmed", "severed"]);
}

/* ====================================================================== 7
 * THE STRUCTURAL ARM, AND THE SITES THIS ITEM DID NOT CHANGE.
 * ===================================================================== */
console.log("\n--- 7. one predicate, its callers counted, and the untouched sites PINNED ---");
{
  /* No behavioural arm can see a faithful copy of a rule. This one can, and it
     is the reason D-267's suite carried the same arm. */
  const defs = (STORE_SRC.match(/#refEdgeSevered\(citingId, targetId/g) || []).length;
  const calls = (STORE_SRC.match(/this\.#refEdgeSevered\(/g) || []).length;
  t("THE RULE HAS EXACTLY ONE IMPLEMENTATION, and D-280 added no second one — the shape that has "
  + "already absorbed a control in this estate",
    defs, 1);
  t("and it is CONSUMED by six call sites, three of them D-280's: #citesInto, #restsOnLive, "
  + "#queueAncestorEdges, #requiredStrengthFor, #routeTask and restingOn. The count is a FLOOR that "
  + "moves when somebody adds a reader, which is precisely the event D-267 could not detect",
    calls >= 6, true);
  /* THE ONE RE-DERIVATION THIS SUITE PERFORMS, and it is a spelling check
     rather than a census: D-280's row printed the corpus and is the authority.
     This asserts only that the site it names still reads the way it named it. */
  t("the driven site really consults the predicate — asserted off the SOURCE as well as through the "
  + "op, because an op arm alone cannot tell a confirmation from a fixture that happened to agree",
    /#requiredStrengthFor[\s\S]{0,3000}?this\.#refEdgeSevered\(citerId, bundleId/.test(STORE_SRC), true);

  /* ---- THE SITES LEFT UNCHANGED, PINNED SO THE JUDGEMENT IS ENFORCED --------
     A silent partial fix is the thing D-280's row exists to prevent, so each
     site this item did not change is asserted to be STILL UNCHANGED, with the
     reason in the label. A later session that changes one of these has to move
     an assertion and read why it was there. */
  t("SITE (c) `reevaluations` IS DELIBERATELY UNCHANGED, and the pin says so: whether severing a "
  + "leg DISCHARGES REC-17's second-look obligation, or whether the obligation is about what the "
  + "record ONCE rested on, is a doctrine question and not an implementation one. The provisional "
  + "is the conservative direction — a re-evaluation prompt shown to somebody who already withdrew "
  + "costs a glance; one dropped costs the second look — and a ruling is raised rather than taken",
    /reevaluations\([\s\S]{0,2600}?#refEdgeSevered/.test(STORE_SRC), false);
  t("SITE (e) `#leadBasisAbsence` IS DELIBERATELY UNCHANGED, AND THE ARGUMENT IS THE PIN: it counts "
  + "basis legs to answer WAS THIS DOCUMENT MADE PART OF A CASE, and a document that was made part "
  + "of a case and then withdrawn from it WAS made part of a case. Reading a severed-only leg as "
  + "`absent` would print `LOOKED FOR AND NOT THERE` about a document that WAS there — an "
  + "affirmative false statement about the record, which this project ranks above a narrow "
  + "inference. The count is the honest instrument and the status is not its question",
    /#leadBasisAbsence\([\s\S]{0,2400}?#refEdgeSevered/.test(STORE_SRC), false);
  t("SITES (f) `#writeSupersededBy` and `#actionDerived` ARE OUT OF THE CLASS AS MEASURED, and the "
  + "pin is what would notice if that stopped being true: no op in the plane writes a `supersedes` "
  + "or `responds_to` reference carrying a status at all, so the exposure is UNMEASURED rather than "
  + "present, and inventing a fixture to assert a behaviour would be manufacturing the shape",
    /status:\s*severed[\s\S]{0,200}rel:\s*(supersedes|responds_to)|rel:\s*(supersedes|responds_to)[\s\S]{0,200}status:\s*severed/
      .test(STORE_SRC), false);
}

} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack ? e.stack : e}`);
  fail++;
}

/* `hygiene.test.mjs` requires every suite to dispose every Miniflare instance it
   made, and it caught this one not doing it. Outside the try/catch so a thrown
   suite still releases its workerd process. */
await mf.dispose();

console.log(`\nd280-strengthbar: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
