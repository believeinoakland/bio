/* NEGATIVE CONTROL: (run 2026-08-05, rec42-agent, FOUR arms, each broken ALONE and restored BYTE-IDENTICALLY — src/store.mjs sha256 7a83b4d237cadca1a9bec46aeefd7e3b4352ba6f75ad4ae4a96f4bf0e055be71 and checks/bio-checks.mjs sha256 0f6136a1192b137dbe2711db7626602d14b2a83a45cfa9cf4af3e17552ce09df, compared before and after every arm; 60 pass when whole) (a) THE ITEM'S OWN — MAKE THE DEFAULT OR: in src/store.mjs #axisResult's partition, `at(m.ground ?? null)` / `at(e.ground ?? null)` -> `at(m.ground ?? ("leg-" + m.ord))` / `at(e.ground ?? ("leg-" + e.ord))`, so an unlabelled leg becomes its own branch -> 49 pass, 11 FAIL. THE HEADLINE IS THE ITEM'S SENTENCE, MEASURED: "the same four legs with NO grounds read WEAKEST-LEG" wanted [graded,C,code-cap,graded,C,charter-con] and got [graded,B,charter-cap,graded,A,code-con] — an UNSTRUCTURED basis got STRONGER on BOTH axes with no act, no name and no date anywhere. The unstructured answer also grows a `grounds` key and a branch sentence (its SHAPE moves, not only its values), the around-the-gate leg stops capping the maximum, and the published unstructured case gains a frozen branch block. It fires in TWO OTHER SUITES too — strength.test.mjs and inquirystrength.test.mjs both fail on the landed weakest-leg answers — which is what shows the correction preserved them rather than rewriting them. (b) COMPOSE ACROSS THE AXES: #strengthWalk `const onAxis = leg.grade_axis === axis;` -> `const onAxis = true;` -> 45 pass, 15 FAIL, the capture axis reading a connection leg's grade inside a branch (capture wanted B/charter-cap, got C/charter-con) and every per-branch, op and frozen-pair assertion after it. (c) SUSPEND THE FINDING ON ONE UNFINISHED BRANCH: #axisResult `if (parts.some((p) => p.state === "undetermined")) {` -> `if (parts.some((p) => p.state === "undetermined") || openBranches.length) {` -> 57 pass, 3 FAIL: the graded branch stops carrying the finding ([graded,C,true,code-con] -> [undetermined,null,false,null]), the naming sentence goes with it, and the axis grows an undetermined_at it should not have. NOTE the first run of this arm THREW instead of failing (D-93 inside a control, readingname's arm (a) again) — every weakest read in this file is optional-chained now and the arm re-ran as three named failures. (d) THE OTHER HALF OF THE DEFAULT, the GATE: checks/bio-checks.mjs checkGrounds `if (labelled.length) {` -> `if (false && labelled.length) {` -> 56 pass, 4 FAIL at BOTH gates — op=promote ACCEPTS a basis whose legs name grounds nobody asserted ([false,"BASIS_REFUSED"] -> [true,null], and the inquiry is now in the store composing by maximum), and the catalog finds nothing wrong with the same bytes. (a) and (d) are the two independent defences of the same rule and each is loud alone, which is why they are separate. (e) THE BRANCH REDACTION — src/store.mjs #redactAxis, the whole `grounds:` mapping replaced by `...(axis.grounds ? { grounds: axis.grounds } : {})` -> 62 pass, 3 FAIL: dave is handed PROJ-2026-1000-secret standing in `capture.grounds[0].weakest.target_id` while the AXIS-level weakest beside it is correctly null — REC-14's measured leak shape reproduced one level down, which is the whole reason the branches are swept rather than assumed covered. (NOTE the arm-(e) sha for store.mjs is 72946cb2fface5fc3238e8b95dad1e18e084631f43403e8eb4dbd51466437581, taken after the header correction that arms (a)–(c) preceded; the file was compared before and after that arm too.)
   (run 2026-08-04, REC-46, and this one is a MEASUREMENT OF THE DEFECT rather than a break-it arm — the three assertions it added were written FIRST and observed to FAIL against the tree as it stood: block 4's `asserted_by: token:member`, `class:member` and `TOKEN:member` all PASSED this gate -> 65 pass, 3 FAIL, while the identical claim spelled `agent` was refused on the line above. `checkGrounds` matched a WORD LIST and knew nothing of the two prefixes index.mjs itself stamps, so the refusal REC-42 recorded held for the words and NOT for the plane's own spelling. TO RE-RUN IT IN ONE STEP: in checks/bio-checks.mjs replace `|| isMachineIdentity(r.asserted_by)) {` with `|| NON_MEMBER_AUTHORS.includes(String(r.asserted_by).toLowerCase())) {` -> these three fail again and nothing else in this suite moves; hygiene.test.mjs names the site under all three of its REC-46 detectors. checks/bio-checks.mjs restored byte-identically, sha256 df71cf184664e696a1ccbb6e4311dbb468443c7185093fa6cff8b972ebfc584e compared before and after; whole suite 68 pass.) */
/* REC-42 / DEC-32: THE AND/OR ARITHMETIC — grounds, and what a basis nobody
 * structured must keep reading.
 *
 * Bob ruled it: *"sometimes the weakest is the claim's strength, and other
 * times it's not. The difference is really whether the relationship between
 * legs is AND or OR."* So legs group into GROUNDS: each ground an AND of its
 * legs, the basis an OR over grounds — MIN within a branch, MAX across
 * branches, PER AXIS, both axes composed independently (DEC-21 unchanged).
 *
 * What is asserted, each in the direction that fails:
 *
 *   1. TWO GROUNDS OF TWO LEGS, and the two axes land on DIFFERENT grounds.
 *      The fixture is built so the flat rule and the structured rule disagree
 *      on BOTH axes and disagree differently, because a suite where MIN and MAX
 *      happen to coincide would pass with the arithmetic wired either way.
 *
 *   2. AN UNSTRUCTURED BASIS IS UNCHANGED, and this is a CORRECTNESS
 *      REQUIREMENT rather than a compatibility nicety (DEC-32's anti-gaming
 *      keystone). The same four legs with no grounds read weakest-leg, the axis
 *      object carries no `grounds` key at all, and no named member grows a
 *      `ground` field: the answer a case got before this item is the answer it
 *      gets after it, to the byte.
 *
 *   3. THE DEFAULT IS AND, asserted where it can actually fail: a ground label
 *      with no attributed `grounds[]` row is REFUSED AT BOTH GATES, and if a
 *      half-labelled projection ever reaches the derivation around that gate,
 *      the unlabelled leg is read as NECESSARY — the answer gets weaker, never
 *      stronger. Two independent defences, each breakable alone.
 *
 *   4. THE ACT IS ATTRIBUTED. "These legs are enough on their own" is the one
 *      thing a member can write that makes a finding STRONGER, so it carries a
 *      named member and a date, and a machine credential cannot assert it.
 *
 *   5. R1 ONE LEVEL UP (DEC-18's pattern applied to grounds). A leg the walk
 *      cannot finish leaves ITS BRANCH undetermined; a second graded branch
 *      still carries the finding and the unfinished branch is NAMED; the axis
 *      is undetermined only when EVERY branch is. D-160: the word for that
 *      state is `undetermined`, the boundary case is UNRATED, and the retired
 *      spelling appears nowhere here either.
 *
 *   6. THROUGH THE OP (D-43), byte-equal to the derivation, with the per-ground
 *      breakdown swept by the same redaction as the axis it sits under.
 *
 *   7. THE FROZEN PAIR FREEZES THE STRUCTURED RESULT (REC-14 clause (e)): a
 *      published case carries the per-branch breakdown in the bytes that get
 *      signed, because "each of these grounds was independently sufficient" is
 *      a claim only a reader who can see the branches is able to test.
 *
 * Q14's CONTRADICTION CASE IS NOT HERE and is not modelled: grounds AGREE on
 * the conclusion, and two conclusions disagreeing is a different, undesigned
 * thing.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit — added by CONDUCT at REC-42's integration; this suite predates M0-8 and hygiene named it */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const CHECKS_SRC = readFileSync(fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url)), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* D-160, and this file inherits the guard rather than restating the rule: the
   word RECONCILED used for the boundary case means the OPPOSITE thing in
   SB-OUTPUT §5.1, so it is assembled from halves here exactly as
   strength.test.mjs assembles it — a suite that spells a forbidden word while
   forbidding it hands the next worker the string to copy. */
const RETIRED_WORD = "SUS" + "PEND";

/* The probe module: the REAL worker and the REAL Store, with one extra door for
   two things no caller has — the DO-internal `/strength` route (the authority
   the op is compared against) and a RAW leg insert. The raw insert is what
   block 3 needs: the write refuses a half-labelled basis, and the only way to
   prove the DERIVATION defends the same rule independently is to put a row into
   the projection around that refusal (#strengthWalk's no-referent arm exists for
   the same reason — an append-only history can hold what the write now stops). */
const PROBE_SRC = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawleg") {
      const p = url.searchParams;
      this.sql.exec(
        "INSERT OR REPLACE INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,grade,grade_axis,grade_source,note,at,ground) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        p.get("from"), Number(p.get("ord") || 0), p.get("to"), p.get("ttype") || "information",
        p.get("role") || "supports", p.get("grade"), p.get("axis"), p.get("source"), null, null,
        p.get("ground") || null);
      return Response.json({ result: { ok: true } });
    }
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname.startsWith("/probe/"))
      return env.STORE.get(env.STORE.idFromName("bio"))
        .fetch(new Request("http://do/" + u.pathname.slice(7) + u.search));
    return worker.fetch(req, env, ctx);
  },
};
`;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("grounds-probe.mjs"), script: PROBE_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec42", MEMBER_TOKEN: "mem-rec42", PROBE_TOKEN: "prb-rec42", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const doGet = async (p) => rP(await (await mf.dispatchFetch(`http://x/probe/${p}`)).json());
const strength = (id) => doGet(`strength?id=${id}`);

/* `weakest?.` throughout, ON PURPOSE and for one reason (inquirystrength's
   precedent, and D-93 inside a control): this suite's own negative controls
   make an axis undetermined where a graded one is expected, and a suite that
   dies on a TypeError there reports LESS than one that names every assertion
   the break moved. The optional chain changes nothing about a real answer —
   block 1 pins the weakest leg by name. */

/* ------------------------------------------------------------------ fixture */

const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-rec42",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);
await enrol("gus", "admin", ["contribute"]);
const CAROL = await enrol("carol", "member", ["contribute", "publish", "create_projects"]);
/* Never invited to carol's project, so block 6 has a reader for whom an id
   inside a visible answer is genuinely invisible. */
const DAVE = await enrol("dave", "member", ["contribute"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const ASSERTED_AT = "2026-08-05T09:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
/* A leg renders exactly the keys it carries: an absent grade is absent in the
   document, and an absent GROUND is absent too — which is the unstructured
   basis this item is required to leave alone. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.ground ? [`    ground: ${l.ground}`] : [])])]
  : [];
/* The ACT, one row per ground. Two top-level keys and not one nested block,
   because the restricted grammar carries a map of scalars or an array of
   objects and never a map holding an array of objects — REC-14's
   completeness/completeness_excluded split, for the same reason. */
const groundLines = (rows) => rows === null ? [] : rows.length
  ? ["grounds:", ...rows.flatMap((r) => [`  - ground: ${r.ground}`,
      ...(r.by === null ? [] : [`    asserted_by: ${r.by ?? "carol"}`]),
      ...(r.at === null ? [] : [`    at: "${r.at ?? ASSERTED_AT}"`]),
      ...(r.statement ? [`    statement: "${r.statement}"`] : [])])]
  : ["grounds: []"];

const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [], grounds = null, extra = [] } = {}) => ["---",
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
  ...legLines(legs), ...groundLines(grounds), ...extra,
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
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, base = null, tok = CAROL) => POST(`op=promote&token=${tok}`, {
  bundleId: id, base, snapKey: `${id}-${base ? sha(base).slice(0, 8) : "new"}-${Math.random().toString(36).slice(2, 6)}`,
  author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  /* REC-18: an INFORMATION bundle registers a capture, because a capture-axis
     grade is EARNED from the capture record and a document with no registered
     bytes has nothing for that axis to measure. */
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
    : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};

/* The capture axis never reaches A (CAPTURE-FIDELITY.md: B is what a direct
   capture by this instance is worth); a CONNECTION grade legitimately does. The
   two axes are not interchangeable even in a fixture. */
const HUNCH = { author: "carol", date: "2026-08-05" };
const g = (target, grade, axis, ground = null, source = axis === "capture" ? "capture" : "hunch") =>
  ({ target, role: "supports", grade, axis, source, ...(source === "hunch" ? HUNCH : {}),
     ...(ground ? { ground } : {}) });

const CH_CAP = "INFO-2026-1000-charter-cap", CH_CON = "INFO-2026-1000-charter-con";
const CO_CAP = "INFO-2026-1000-code-cap", CO_CON = "INFO-2026-1000-code-con";
const SPARE = "INFO-2026-1000-spare";
for (const d of [CH_CAP, CH_CON, CO_CAP, CO_CON, SPARE]) await mustPromote(d, infoMd(d), "information");

/* THE FIXTURE THAT MAKES THE ARITHMETIC FALSIFIABLE. Two grounds of two legs:
     charter:  capture B, connection C
     code:     capture C, connection A
   MIN within, MAX across:  capture = B (charter), connection = A (code).
   The FLAT rule would read capture C and connection C. So the two rules
   disagree on BOTH axes, and the two axes are set by DIFFERENT grounds — a
   suite whose axes agreed would pass with the composition wired either way. */
const CHARTER = [g(CH_CAP, "B", "capture", "charter"), g(CH_CON, "C", "connection", "charter")];
const CODE = [g(CO_CAP, "C", "capture", "code"), g(CO_CON, "A", "connection", "code")];
const TWO_GROUNDS = [...CHARTER, ...CODE];
const GROUND_ROWS = [{ ground: "charter" }, { ground: "code" }];
const targetsOf = (legs) => legs.map((l) => l.target);

/* ==================================================================== 1 */
console.log("--- 1. two grounds of two legs: MAX over grounds, MIN within, per axis ---");
const OR2 = "INQ-2026-1000-two-grounds";
{
  await mustPromote(OR2, inquiryMd(OR2, { refs: targetsOf(TWO_GROUNDS), legs: TWO_GROUNDS,
                                          grounds: GROUND_ROWS }), "inquiry");
  const s = await strength(OR2);
  t("CAPTURE reads B — the STRONGEST ground, not the weakest leg (the flat rule would say C)",
    [s.capture.state, s.capture.grade, s.capture.weakest?.target_id ?? null], ["graded", "B", CH_CAP]);
  t("CONNECTION reads A — and it is set by the OTHER ground, so the axes are composed independently",
    [s.connection.state, s.connection.grade, s.connection.weakest?.target_id ?? null], ["graded", "A", CO_CON]);
  t("the weakest leg of the LOSING ground sets nothing: neither axis reads C",
    [s.capture.grade === "C", s.connection.grade === "C"], [false, false]);

  t("each GROUND is an AND of its legs and reads its own weakest, per axis: charter capture B, code capture C",
    s.capture.grounds.map((x) => [x.ground, x.state, x.grade, x.weakest?.target_id ?? null]),
    [["charter", "graded", "B", CH_CAP], ["code", "graded", "C", CO_CAP]]);
  t("and on the connection axis the same two branches read the other way round",
    s.connection.grounds.map((x) => [x.ground, x.state, x.grade, x.weakest?.target_id ?? null]),
    [["charter", "graded", "C", CH_CON], ["code", "graded", "A", CO_CON]]);
  t("a branch's own legs stay VISIBLE per branch — a reader tests sufficiency rather than taking it",
    s.capture.grounds.map((x) => [x.population, x.load_bearing]), [[2, 1], [2, 1]]);
  t("the axis still counts the WHOLE population, so nothing left a branch and vanished",
    [s.capture.population, s.connection.population], [4, 4]);
  /* CORRECTED 2026-08-09 AT D-269, and the old assertion was WRONG rather than
     merely stale. It pinned `STRONGEST of the 2 independently sufficient
     grounds` — so this suite was the thing HOLDING IN PLACE a live breach of
     DEC-32 clause 1 (*"NEVER show AND / OR / disjunction / grounds"*), because
     that sentence is rendered verbatim to members at five channels: the axis
     panel on the inquiry page, the same panel on the PUBLISHED SIGNED case, the
     undetermined pane, `legConsequence` beside the weakest leg, and a leg's
     `why` where `#strengthWalk` embeds the whole sentence. WHAT THE ASSERTION
     IS FOR is unchanged and is asserted below: the sentence says the grade came
     from the strongest set and NAMES it. Only the nouns moved, onto the words
     UI-27's elicitation already renders. `test/analystvocab.test.mjs` is the
     instrument that will not let them move back. */
  t("the sentence says the grade came from the strongest set of reasons and names it",
    [/STRONGEST of the 2 sets of reasons that each carry this conclusion on their own/.test(s.capture.detail),
     s.capture.detail.includes('"charter"'), s.connection.detail.includes('"code"')],
    [true, true, true]);
  t("a MIN across the two branches is what the arithmetic must NOT do: it would have read C on both",
    [s.capture.grade, s.connection.grade], ["B", "A"]);

  /* A leg carries its branch on the named member, so a reader sent to check
     the weakest leg is told which argument it belongs to. */
  t("the named weakest leg carries its own ground",
    [s.capture.weakest?.ground ?? null, s.connection.weakest?.ground ?? null], ["charter", "code"]);
  t("D-160: the state words are graded/unrated/undetermined and the retired one appears nowhere",
    new RegExp(RETIRED_WORD, "i").test(JSON.stringify(s)), false);
}

/* ==================================================================== 2 */
console.log("\n--- 2. AN UNSTRUCTURED BASIS IS UNCHANGED — the correctness requirement ---");
const FLAT = "INQ-2026-1001-unstructured";
{
  const legs = TWO_GROUNDS.map((l) => { const { ground, ...rest } = l; return rest; });
  await mustPromote(FLAT, inquiryMd(FLAT, { refs: targetsOf(legs), legs }), "inquiry");
  const s = await strength(FLAT);
  t("the same four legs with NO grounds read WEAKEST-LEG, exactly as before this item",
    [s.capture.state, s.capture.grade, s.capture.weakest?.target_id ?? null,
     s.connection.state, s.connection.grade, s.connection.weakest?.target_id ?? null],
    ["graded", "C", CO_CAP, "graded", "C", CH_CON]);
  t("and that is STRICTLY WEAKER than the structured answer on both axes: structure is what earns the max",
    [(await strength(OR2)).capture.grade, s.capture.grade,
     (await strength(OR2)).connection.grade, s.connection.grade], ["B", "C", "A", "C"]);
  t("the axis object carries NO `grounds` key at all — the answer's SHAPE is unchanged, not just its values",
    [Object.keys(s.capture).includes("grounds"), Object.keys(s.connection).includes("grounds")],
    [false, false]);
  t("the axis object's key set is the pre-REC-42 one, field for field",
    Object.keys(s.capture).sort(),
    ["axis", "depth_bound", "detail", "determined", "grade", "load_bearing",
     "not_load_bearing", "population", "state", "weakest"]);
  t("no named member grows a `ground` field either, so an unstructured leg reads byte-identically",
    [Object.keys(s.capture.weakest).includes("ground"),
     s.connection.not_load_bearing.some((m) => Object.keys(m).includes("ground"))], [false, false]);
  t("and the sentence is the landed one, with no branch vocabulary in it",
    [/no stronger than the weakest capture it rests on/.test(s.capture.detail),
     /ground/.test(s.capture.detail)], [true, false]);
}

/* ==================================================================== 3 */
console.log("\n--- 3. THE DEFAULT IS AND: two independent defences, the gate and the arithmetic ---");
{
  /* (a) THE GATE. A label with no attributed row is refused AT THE WRITE. */
  const NOACT = "INQ-2026-1002-unattributed";
  const r = await promote(NOACT, inquiryMd(NOACT, { refs: targetsOf(TWO_GROUNDS), legs: TWO_GROUNDS,
                                                    grounds: null }), "inquiry");
  t("a basis whose legs name grounds with NO grounds[] block is REFUSED at the write",
    [r.ok, r.reason], [false, "BASIS_REFUSED"]);
  t("and the refusal says what it is protecting: nothing gets stronger without an attributed act",
    /affirmative, attributed act/.test(JSON.stringify(r.findings)), true);
  t("the refused write landed NOTHING: the inquiry does not exist and has no legs",
    (await doGet(`basis?id=${NOACT}`)).legs.length, 0);

  /* THE SAME RULE, THE OTHER GATE. One catalog function serves both, so a
     hand-written document cannot audit clean where the write refuses. */
  const findings = (await checkBundle({ folderName: NOACT,
    files: new Map([["bundle.md", inquiryMd(NOACT, { refs: targetsOf(TWO_GROUNDS), legs: TWO_GROUNDS })]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true })).findings.filter((x) => x.severity === "error");
  t("the CATALOG names the same document, so the rule is one function and not two copies",
    findings.some((x) => /no grounds\[\] block/.test(x.message)), true);
  t("and the store's write path calls the catalog's function rather than restating the rule",
    /checkInquiryBasis\(basisFm, bf,/.test(STORE_SRC), true);

  /* (b) THE ARITHMETIC, INDEPENDENTLY. A half-labelled basis is refused at the
     write too — but history is append-only and a row can reach the projection
     around a gate, so the derivation must not depend on the refusal. An
     unlabelled leg is NECESSARY: it binds every branch, and the answer is the
     MINIMUM of the two parts. Weaker, never stronger. */
  const HALF = "INQ-2026-1003-half";
  const half = [g(CH_CAP, "B", "capture", "charter"), g(CO_CAP, "C", "capture", "code"),
                g(SPARE, "D", "connection")];
  const hr = await promote(HALF, inquiryMd(HALF, { refs: targetsOf(half), legs: half,
                                                   grounds: GROUND_ROWS }), "inquiry");
  t("a HALF-labelled basis is refused: a basis is grouped whole or not at all",
    [hr.ok, /carr(ies|y) no ground while/.test(JSON.stringify(hr.findings ?? []))], [false, true]);

  /* Written straight into the projection, which is the only way past the
     refusal above — the same door strength.test.mjs uses for a cycle. */
  const RAW = "INQ-2026-1004-around-the-gate";
  await mustPromote(RAW, inquiryMd(RAW), "inquiry");
  await doGet(`rawleg?from=${RAW}&ord=0&to=${CH_CAP}&grade=B&axis=capture&source=capture&ground=charter`);
  await doGet(`rawleg?from=${RAW}&ord=1&to=${CO_CAP}&grade=B&axis=capture&source=capture&ground=code`);
  const sr0 = await strength(RAW);
  t("with both legs labelled the axis reads the strongest ground: B",
    [sr0.capture.state, sr0.capture.grade], ["graded", "B"]);
  await doGet(`rawleg?from=${RAW}&ord=2&to=${SPARE}&grade=D&axis=capture&source=capture`);
  const sr = await strength(RAW);
  t("add ONE UNLABELLED leg around the gate and the axis gets WEAKER, never stronger: D",
    [sr.capture.state, sr.capture.grade, sr.capture.weakest?.target_id ?? null], ["graded", "D", SPARE]);
  /* CORRECTED 2026-08-09 AT D-269 — THE NOUN ONLY, same reason as the three
     blocks above. THIS ONE IS RECORDED SEPARATELY BECAUSE OF HOW IT WAS FOUND:
     D-269's own consumer-impact grep searched for the sentence's phrase as the
     SOURCE spells it (`is needed by every ground`) and this assertion spells it
     `needed by every ground`, so the grep MISSED IT and reported three
     consumers where there were four. That is the identical failure UI-43's
     first matcher made one layer up — a matcher keyed on a spelling
     under-reports and says the problem is smaller than it is. The BATTERY found
     it, in one run, which is why the battery is the consumer instrument and a
     grep is only a hint. */
  t("the unlabelled leg is read as NECESSARY and the sentence says so",
    /needed by every one of those sets/.test(sr.capture.detail), true);
  t("it is carried as its own implicit branch, listed with a null label beside the two authored ones",
    sr.capture.grounds.map((x) => [x.ground, x.grade]), [["charter", "B"], ["code", "B"], [null, "D"]]);
  t("so the strengthening direction is unreachable by omission: the max is capped by the AND part",
    Store_rank(sr.capture.grade) <= Store_rank(sr0.capture.grade), true);
}
function Store_rank(gr) { return { A: 4, B: 3, C: 2, D: 1 }[gr] ?? 0; }

/* ==================================================================== 4 */
console.log("\n--- 4. the act is ATTRIBUTED: a named member, a date, and one row per ground ---");
{
  const bad = async (id, opts) => promote(id, inquiryMd(id, opts), "inquiry");
  const msg = (r) => JSON.stringify(r.findings ?? []);
  const base = { refs: targetsOf(TWO_GROUNDS), legs: TWO_GROUNDS };

  const r1 = await bad("INQ-2026-1005-machine",
    { ...base, grounds: [{ ground: "charter", by: "agent" }, { ground: "code" }] });
  t("a MACHINE cannot assert independent sufficiency — it is an authored judgment with a name on it",
    [r1.ok, /is not a named member/.test(msg(r1))], [false, true]);

  /* REC-46. THE WORD LIST IS NOT THE PLANE'S OWN SPELLING, and until this item
     these two passed. `index.mjs` stamps a machine credential `token:<class>`
     on every authorship field and `class:<class>` on every ownership one; the
     gate refused an `asserted_by` by matching a WORD LIST that knew neither, so
     the arm above ("agent") fired while the two spellings the plane ITSELF
     mints walked straight through the hand-written door. REC-45's act closes it
     for every caller arriving through an op because it never reads the field —
     this is the other door, and it is the one a caller hand-writing bundle.md
     uses. Both spellings are asserted, not just the routed one: `class:` was
     found by sweeping for the class rather than trusting the routed count, and
     leaving it out would have closed one half of the same hole.
     The refusal must be the SAME refusal — same finding, same sentence — so a
     reader cannot tell from the answer which spelling was tried. */
  for (const spelling of ["token:member", "class:member", "TOKEN:member"]) {
    const rm = await bad(`INQ-2026-105${["token:member", "class:member", "TOKEN:member"].indexOf(spelling)}-stamp`,
      { ...base, grounds: [{ ground: "charter", by: spelling }, { ground: "code" }] });
    t(`the spelling the control plane itself mints for a machine is refused too: ${spelling}`,
      [rm.ok, /is not a named member/.test(msg(rm))], [false, true]);
  }

  const r2 = await bad("INQ-2026-1006-undated",
    { ...base, grounds: [{ ground: "charter", at: null }, { ground: "code" }] });
  t("an UNDATED assertion is refused: structure authored after a strength was seen is a different act",
    [r2.ok, /ISO timestamp/.test(msg(r2))], [false, true]);

  const r3 = await bad("INQ-2026-1007-twice",
    { ...base, grounds: [{ ground: "charter" }, { ground: "charter" }, { ground: "code" }] });
  t("one ground, one assertion, one member answering for it — a second row for the same label is refused",
    [r3.ok, /a second time/.test(msg(r3))], [false, true]);

  const r4 = await bad("INQ-2026-1008-empty-ground",
    { ...base, grounds: [...GROUND_ROWS, { ground: "practice" }] });
  t("a ground NO LEG belongs to is refused: a ground is a partition of the legs",
    [r4.ok, /which no basis leg belongs to/.test(msg(r4))], [false, true]);

  const r5 = await bad("INQ-2026-1009-no-legs", { grounds: GROUND_ROWS });
  t("and a grounds[] block over NO BASIS AT ALL is refused at the write, not only in the catalog",
    [r5.ok, /which no basis leg belongs to/.test(msg(r5))], [false, true]);

  const r6 = await bad("INQ-2026-1010-badlabel",
    { ...base, legs: [g(CH_CAP, "B", "capture", 'char"ter'), ...CODE],
      grounds: [{ ground: 'char"ter' }, { ground: "code" }] });
  t("a label carrying quotes is refused before it can reach a sentence a reader trusts",
    [r6.ok, /is not a ground label/.test(msg(r6))], [false, true]);

  /* WHAT IS DELIBERATELY NOT REQUIRED, asserted so nobody adds it back: DEC-32
     rules that minting a falsifier per ground reads as more honest and is less
     — it converts one compound falsifier (EVERY ground fails) into several
     partial ones, none of which refutes the finding. */
  t("no per-ground falsifier is required, or accepted as one: the compound falsifier stays the finding's",
    /falsifier/i.test(CHECKS_SRC.slice(CHECKS_SRC.indexOf("function checkGrounds"),
                                       CHECKS_SRC.indexOf("function checkEarnedLeg"))),
    false);

  const okr = await promote("INQ-2026-1011-statement",
    inquiryMd("INQ-2026-1011-statement", { ...base,
      grounds: [{ ground: "charter", statement: "The charter grants the authority outright." },
                { ground: "code", statement: "The code does not forbid it." }] }), "inquiry");
  t("an optional per-ground statement is legal — a plain-words label for the reader, gating nothing",
    okr.ok, true);
}

/* ==================================================================== 5 */
console.log("\n--- 5. R1 one level up: an unfinished leg leaves ITS branch undetermined ---");
{
  /* A chain deeper than the bound, exactly as strength.test.mjs builds one:
     the walk stops and what lies below is unknown rather than absent. */
  const D = (n) => `INQ-2026-1012-d${n}`;
  await mustPromote(D(8), inquiryMd(D(8), { refs: [CH_CAP], legs: [g(CH_CAP, "B", "capture")] }), "inquiry");
  for (let i = 7; i >= 0; i--)
    await mustPromote(D(i), inquiryMd(D(i), { refs: [D(i + 1)], legs: [g(D(i + 1), "A", "connection")] }), "inquiry");
  t("the deep chain really is undetermined on its own", (await strength(D(0))).connection.state, "undetermined");

  const MIXED = "INQ-2026-1013-one-open-branch";
  const legs = [g(D(0), "A", "connection", "deep"), g(CO_CON, "C", "connection", "code")];
  await mustPromote(MIXED, inquiryMd(MIXED, { refs: targetsOf(legs), legs,
    grounds: [{ ground: "deep" }, { ground: "code" }] }), "inquiry");
  const s = await strength(MIXED);
  t("the unfinished leg leaves ITS OWN branch undetermined, and only that branch",
    s.connection.grounds.map((x) => [x.ground, x.state]), [["deep", "undetermined"], ["code", "graded"]]);
  t("the SECOND graded branch still carries the finding: the axis is graded at C",
    [s.connection.state, s.connection.grade, s.connection.determined, s.connection.weakest?.target_id ?? null],
    ["graded", "C", true, CO_CON]);
  /* CORRECTED 2026-08-09 AT D-269 — THE NOUN ONLY, same reason as the block
     above. `ground` is the analyst's word and clause 1 forbids it on any
     member-facing surface; the property (the unfinished set is NAMED, and the
     sentence says which way it could move) is untouched. */
  t("the unfinished set is NAMED rather than dropped, and the sentence says which way it could move",
    [/1 further set is UNDETERMINED and could only be stronger, never weaker/.test(s.connection.detail),
     s.connection.detail.includes('"deep"')], [true, true]);
  t("the branch names WHERE it stopped, so a reader is sent to the leg and not to the hop",
    (s.connection.grounds[0].undetermined_at ?? []).map((m) => m.target_id), [D(0)]);
  t("and the axis itself carries no undetermined_at, because the axis is not the thing that is unknown",
    Object.keys(s.connection).includes("undetermined_at"), false);

  /* EVERY branch unfinished — and only then does the finding go with them. */
  const ALLOPEN = "INQ-2026-1014-every-branch-open";
  const legs2 = [g(D(0), "A", "connection", "deep"), g(D(1), "A", "connection", "deeper")];
  await mustPromote(ALLOPEN, inquiryMd(ALLOPEN, { refs: targetsOf(legs2), legs: legs2,
    grounds: [{ ground: "deep" }, { ground: "deeper" }] }), "inquiry");
  const s2 = await strength(ALLOPEN);
  t("with EVERY branch unfinished the axis is undetermined — the boundary the composition turns on",
    [s2.connection.state, s2.connection.grade, s2.connection.determined],
    ["undetermined", null, false]);
  /* CORRECTED 2026-08-09 AT D-269 — THE NOUN ONLY, same reason. */
  t("and it says so in the plural, naming the depth rather than a low score",
    [/EVERY one of the 2 sets of reasons it rests on is undetermined/.test(s2.connection.detail),
     /depth bound of 6/.test(s2.connection.detail)], [true, true]);
  /* CORRECTED WHILE WRITING, and kept because the first version was wrong in an
     instructive way: this inquiry's CAPTURE axis is undetermined too, not
     unrated, because both legs are inquiry legs whose sub-walks exhausted — an
     unknown reached through a leg is unknown on every axis it carries. The
     distinction being asserted needs a genuinely UNRATED axis beside it. */
  const NOTHING = "INQ-2026-1014-nothing-graded";
  const legs3 = [{ target: CH_CAP, role: "supports", ground: "one" },
                 { target: CO_CAP, role: "supports", ground: "two" }];
  await mustPromote(NOTHING, inquiryMd(NOTHING, { refs: targetsOf(legs3), legs: legs3,
    grounds: [{ ground: "one" }, { ground: "two" }] }), "inquiry");
  const s3 = await strength(NOTHING);
  t("undetermined is still not UNRATED: two grounds carrying no grade at all read UNRATED, not unknown",
    [s2.connection.state, s3.capture.state, s3.capture.grade, s3.capture.grounds.map((x) => x.state)],
    ["undetermined", "unrated", null, ["unrated", "unrated"]]);
  t("an unrated ground is INERT exactly as an ungraded leg is (DEC-18) — every leg still named",
    s3.capture.not_load_bearing.map((m) => m.target_id).sort(), [CH_CAP, CO_CAP].sort());
}

/* ==================================================================== 6 */
console.log("\n--- 6. through the OP (D-43), byte-equal, with the branches swept by the same redaction ---");
{
  const op = await GET(`op=inquirystrength&token=${CAROL}&id=${OR2}`);
  t("op=inquirystrength serves the STRUCTURED pair to a real caller",
    [op.ok, op.capture.grade, op.connection.grade], [true, "B", "A"]);
  t("and it is byte-equal to the derivation, branches and all — never a rebuilt shape",
    [JSON.stringify(op.capture) === JSON.stringify((await strength(OR2)).capture),
     JSON.stringify(op.connection) === JSON.stringify((await strength(OR2)).connection)],
    [true, true]);
  t("the per-ground breakdown is redacted by the SAME sweep as the axis, not by a second one",
    /axis\.grounds \? \{ grounds: axis\.grounds\.map/.test(STORE_SRC), true);

  /* AND THE SWEEP IS DRIVEN, not just read out of the source — REC-14's
     measured leak shape (`#requiredStrengthFor` spelled the same project ids
     into its prose that its fields named). A PROJECT is the only thing
     viewerPredicate filters today, and C-2.8 refuses a project-typed leg at the
     write, so the raw door is the only way to put an id a reader may not see
     INSIDE a branch of a visible answer. */
  const PROJ = "PROJ-2026-1000-secret";
  const projMd = ["---", `id: ${PROJ}`, "object_type: project", "schema: project@1",
    `title: "Secret ${PROJ}"`, "current_state: forming", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${LATER}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high",
    "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "visuals: []",
    "---", "", "## Summary", "", "A project nobody else is invited to.", ""].join("\n");
  await mustPromote(PROJ, projMd, "project");
  const HID = "INQ-2026-1017-hidden-branch";
  await mustPromote(HID, inquiryMd(HID), "inquiry");
  await doGet(`rawleg?from=${HID}&ord=0&to=${PROJ}&ttype=project&grade=B&axis=capture&source=capture&ground=quiet`);
  await doGet(`rawleg?from=${HID}&ord=1&to=${CO_CAP}&ttype=information&grade=C&axis=capture&source=capture&ground=open`);
  const mine = await GET(`op=inquirystrength&token=${CAROL}&id=${HID}`);
  const theirs = await GET(`op=inquirystrength&token=${DAVE}&id=${HID}`);
  t("the owner sees the branch's weakest leg by name",
    [mine.capture.grade, mine.capture.grounds[0].weakest?.target_id ?? null], ["B", PROJ]);
  /* Written WITHOUT the `?? fallback` this file uses elsewhere, on purpose: a
     WITHHELD id is `null` and an ABSENT member is `null` too, so a fallback here
     would report the two the same and the assertion would pass whether the
     branch object survived or vanished. The member must still BE there, with
     its id and nothing else removed. */
  t("a reader who may not see it gets the id withheld INSIDE THE BRANCH, not only on the axis",
    [theirs.capture.grounds[0].weakest === null ? "NO MEMBER AT ALL" : theirs.capture.grounds[0].weakest.target_id,
     theirs.capture.weakest === null ? "NO MEMBER AT ALL" : theirs.capture.weakest.target_id,
     theirs.capture.grounds[0].weakest?.grade ?? null], [null, null, "B"]);
  t("every RECORD FACT in the branch stands unchanged — the derivation is the same for both readers",
    [theirs.capture.grade, theirs.capture.grounds.map((x) => [x.ground, x.state, x.grade])],
    ["B", [["quiet", "graded", "B"], ["open", "graded", "C"]]]);
  t("and the answer FLAGS that it names less than the record holds, without counting what was withheld",
    [theirs.capture.out_of_view ?? null, /\d+ withheld/.test(JSON.stringify(theirs))], [true, false]);
  t("no id the reader may not see survives anywhere in the answer, prose included",
    JSON.stringify(theirs).includes(PROJ), false);
  t("the branches reach the caller with their own weakest legs named",
    op.capture.grounds.map((x) => [x.ground, x.grade, x.weakest?.target_id ?? null]),
    [["charter", "B", CH_CAP], ["code", "C", CO_CAP]]);
  t("an unstructured inquiry answers the caller with no branch machinery at all",
    Object.keys((await GET(`op=inquirystrength&token=${CAROL}&id=${FLAT}`)).capture).includes("grounds"),
    false);
}

/* ==================================================================== 7 */
console.log("\n--- 7. the frozen pair freezes the STRUCTURED result (REC-14, clause (e)) ---");
{
  const CASE = "INQ-2026-1015-case";
  await mustPromote(CASE, inquiryMd(CASE, { refs: targetsOf(TWO_GROUNDS), legs: TWO_GROUNDS,
                                            grounds: GROUND_ROWS }), "inquiry");
  const c = await GET(`op=conclude&token=${CAROL}&target=${CASE}`
    + `&conclusion=${encodeURIComponent("The transfer was authorised.")}`
    + `&falsifier=${encodeURIComponent("A charter provision or a code section forbidding it.")}`);
  t("the case concludes", c.ok, true);
  /* REC-44 / DEC-44 (2026-08-04): `scope` is authored per case per edition and
     required — what brought these findings together. The rest of this block is
     unchanged; the frozen PER-FINDING pair is what it measures and DEC-44 leaves
     that altitude exactly where REC-42 put it. */
  const pub = await POST(`op=publish&token=${CAROL}`, { target: CASE,
    scope: "Whether the FY2024 transfer was authorised.",
    statement: "This case covers the authorisation question on the documents in hand.",
    excluded: [], subjectPosition: "sought_and_answered",
    subjectJustification: "We put the question to the Clerk and they answered in writing.",
    /* ADDED 2026-08-05, REC-47 / DEC-46 (a): fixture, not this suite's subject. */
    biasAcknowledgement: "The group's declared position on public adoption of transfers is the lens this "
                       + "case was made under." });
  t("it publishes at edition 1", [pub.ok, pub.edition], [true, 1]);
  /* CORRECTED 2026-08-04, REC-44 / DEC-44: the frozen pair belongs to the
     FINDING, so it is read from findings[]. REC-42's arithmetic is untouched —
     the composed answer is still MAX over independently sufficient grounds and
     MIN over necessary legs, per axis — and the values demanded are the same. */
  t("the FROZEN PAIR carries the composed answer — the strongest ground, not the weakest leg",
    pub.findings[0].strength.map((a) => [a.axis, a.state, a.grade]),
    [["capture", "graded", "B"], ["connection", "graded", "A"]]);

  const md = (await GET(`op=image&token=${CAROL}&id=${CASE}`))["bundle.md"];
  t("the per-branch breakdown is IN THE BYTES THAT GET SIGNED, one row per ground per axis",
    [/^published_strength_grounds:$/m.test(md),
     (md.match(/^ {2}- axis: /gm) || []).length], [true, 6]);
  t("and each row says which branch reached what, so the sufficiency claim is checkable",
    [/ {4}ground: "charter"\n {4}state: graded\n {4}grade: B/.test(md),
     / {4}ground: "code"\n {4}state: graded\n {4}grade: C/.test(md)], [true, true]);
  t("the published case AUDITS CLEAN against the catalog",
    (await checkBundle({ folderName: CASE, files: new Map([["bundle.md", md]]),
      sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
      resolveTarget: () => true,
      earnedRegistry: await GET(`op=earnedbasis&token=${CAROL}&id=${CASE}`) })).findings
      .filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`), []);

  /* STRIP THE FROZEN STRUCTURE and the catalog names it: a grade produced by a
     maximum over branches, published with the branches invisible, is a claim no
     reader can test. */
  const stripped = md.replace(/^published_strength_grounds:\n(?: {2}- axis:.*\n(?: {4}.*\n)*)+/m, "");
  const errs = (await checkBundle({ folderName: CASE, files: new Map([["bundle.md", stripped]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true,
    earnedRegistry: await GET(`op=earnedbasis&token=${CAROL}&id=${CASE}`) })).findings
    .filter((x) => x.severity === "error");
  t("strip it and the published case STOPS auditing clean, by name",
    [stripped !== md, errs.some((x) => /requires published_strength_grounds/.test(x.message))],
    [true, true]);
  /* AND THE OTHER DIRECTION, driven rather than asserted about the same bytes:
     a case whose legs were never grouped publishes with no such block at all,
     and audits clean without one. The block's PRESENCE is the signal that a
     member authored structure. */
  const PLAIN = "INQ-2026-1016-plain-case";
  const plainLegs = TWO_GROUNDS.map((l) => { const { ground, ...rest } = l; return rest; });
  await mustPromote(PLAIN, inquiryMd(PLAIN, { refs: targetsOf(plainLegs), legs: plainLegs }), "inquiry");
  await GET(`op=conclude&token=${CAROL}&target=${PLAIN}`
    + `&conclusion=${encodeURIComponent("The transfer was authorised.")}`
    + `&falsifier=${encodeURIComponent("A charter provision forbidding it.")}`);
  const pub2 = await POST(`op=publish&token=${CAROL}`, { target: PLAIN,
    scope: "Whether the transfer was authorised, on the two documents named.",
    statement: "This case covers the authorisation question on the two documents named.",
    excluded: [], subjectPosition: "not_sought",
    subjectJustification: "Notice would let the record be revised before it is captured; we say so.",
    /* ADDED 2026-08-05, REC-47. */
    biasAcknowledgement: "The same declared position on public adoption frames the unstructured case too." });
  const md2 = (await GET(`op=image&token=${CAROL}&id=${PLAIN}`))["bundle.md"];
  t("an UNSTRUCTURED published case carries NO frozen branch block, and audits clean without one",
    [pub2.ok, /published_strength_grounds/.test(md2),
     (await checkBundle({ folderName: PLAIN, files: new Map([["bundle.md", md2]]),
       sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
       resolveTarget: () => true,
       earnedRegistry: await GET(`op=earnedbasis&token=${CAROL}&id=${PLAIN}`) })).findings
       .filter((x) => x.severity === "error").length], [true, false, 0]);
  t("and its frozen pair is the WEAKEST LEG on both axes, which is what an ungrouped case is worth",
    pub2.findings[0].strength.map((a) => [a.axis, a.grade]), [["capture", "C"], ["connection", "C"]]);
}

await mf.dispose();
console.log(`\ngrounds: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
