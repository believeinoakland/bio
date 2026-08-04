/* NEGATIVE CONTROL: (re-run in one step) in src/store.mjs groundInquiry, make the act HONOUR a caller-supplied attribution instead of stamping it — in the `asked.push({ label, ords: [...ords].sort(...), statement: stmt });` line append `, by: row.asserted_by, when: row.at`, and in the `rowsOut` map replace `asserted_by: carry ? Store.#fmSafe(prior.asserted_by) : Store.#fmSafe(who)` with `... : Store.#fmSafe(a.by ?? who)` and `at: carry ? Store.#fmSafe(prior.at) : when` with `... : Store.#fmSafe(a.when ?? when)`. RUN 2026-08-04, rec45-agent, src/store.mjs restored BYTE-IDENTICALLY (sha256 1f6323dc2ceedaf41cce04716a790d88a3df5b07e5fa11475cc5a3da29e0146c, compared before and after) -> 74 pass, 7 FAIL, every one of them in block 2 and every one of them naming an attribution nobody made: the returned rows come back asserted_by ["mallory","token:member"] where they must read ["carol","carol"], the STORED bundle.md contains the string "mallory", the backdate "2020-01-01T00:00:00Z" and the machine asserter "token:member", and the three assertions that the bytes hold NEITHER the invented name NOR the invented date fail with both present. Block 1 and blocks 3-8 stay green throughout, which is the point of the arm: the act still works perfectly, it is only the ATTRIBUTION that has become the caller's — an attribution a caller can hand us is one a caller can invent (CLAUDE.md), and it is invisible in every other measurement. AND THE ARM MEASURED SOMETHING THE ITEM DID NOT PREDICT, recorded here rather than smoothed away: "token:member" LANDED IN THE DOCUMENT AND THE GATE ACCEPTED IT. checkGrounds refuses an asserted_by in NON_MEMBER_AUTHORS ('agent', 'claude', 'daemon', ...) and knows nothing about the `token:<class>` prefix index.mjs actually stamps for a machine credential, so REC-42's "the gate already refuses a machine asserter" is true for the word list and NOT for the spelling the plane itself uses. This act closes that door for every caller who arrives through an op — it never reads the field — and the HAND-WRITTEN op=promote door is still open. Reported to CONDUCT as a routed item; NOT fixed here, because checks/bio-checks.mjs is REC-42's ground and the fix is a question about having ONE machine-identity predicate rather than two. */
/* REC-45 / DEC-32 clause 6: `op=inquiryground` — THE ACT THAT AUTHORS THE
 * GROUNDS PARTITION.
 *
 * REC-42 built the structure and both gates that defend it and left ONE gap,
 * routed here rather than closed there: nothing AUTHORED it. A partition
 * reached the record only through a hand-written `bundle.md`, so DEC-32's
 * clause 6 — restructuring after seeing a strength is legal, RECORDED AND
 * ATTRIBUTED, with the system permitted to NOTICE the pattern — was unreachable
 * in both halves, because neither is possible without an act carrying a reason.
 *
 * What is asserted, each in the direction that fails:
 *
 *   1. THE ACT REACHES THE ARITHMETIC. A partition authored through the op
 *      moves the composed pair from weakest-leg to MAX-over-grounds, on BOTH
 *      axes, and the fixture is built so the flat rule and the structured rule
 *      disagree on both — a suite where they coincided would pass with the act
 *      wired to nothing.
 *
 *   2. THE ATTRIBUTION IS THE SERVER'S, AND A CALLER'S IS DISCARDED. Not
 *      "overridden": the suite asserts the caller's invented name and date
 *      appear NOWHERE in the bytes, because a value that merely loses an
 *      assignment is one an extra code path can win back. This is the item's
 *      own negative control and the reason it exists — REC-42's gate refuses a
 *      MACHINE asserter and an UNDATED assertion, and cannot tell a member's
 *      real name from a well-formed invented one.
 *
 *   3. A RESTRUCTURE TAKES A REASON AND A FIRST AUTHORSHIP DOES NOT, with the
 *      distinction read off the RECORD and never off a parameter. And what
 *      CARRIES FORWARD is asserted: a group whose legs did not move keeps the
 *      name and the date it already had, because the assertion is about the
 *      legs; a group whose membership moved becomes this member's assertion,
 *      now. Only that makes DEC-32's "before or after the strength was seen"
 *      a question a reader can answer.
 *
 *   4. A MACHINE CREDENTIAL IS REFUSED BY NAME, on the established precedent —
 *      MACHINE_CANNOT_GROUND, reached and refused rather than absent.
 *
 *   5. ONE GRAMMAR AT BOTH GATES. Four REC-42 refusals are driven through THIS
 *      ACT and through op=promote on a hand-written document, and the check id
 *      AND the message string are asserted EQUAL — which is what "the catalog's
 *      one checkGrounds, never a second grammar" means when it is measured
 *      rather than intended.
 *
 *   6. THROUGH THE OP (D-43) and PUBLISHED BY op=affordances with its prompt,
 *      so a surface that can offer the act necessarily has the wording that
 *      must accompany it (DEC-29(b), REC-16's mechanism).
 *
 * Q14's contradiction case is not here and is not modelled, and no member-facing
 * string in this act says AND, OR, disjunction, branch or `ground` — DEC-32
 * clause 1 — which block 6 asserts of the published prompt and label directly.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec45", MEMBER_TOKEN: "mem-rec45", PROBE_TOKEN: "prb-rec45", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

/* THE ACT, through the CONTROL PLANE and with the literal op name
   uninterpolated, so coverage credits it here (D-43: op=invitelook shipped with
   a ReferenceError while 1276 store-level assertions passed). */
const ground = async (tok, { target, ...body }) =>
  POST(`op=inquiryground&token=${tok}&target=${encodeURIComponent(target ?? "")}`, body);
const affordances = async (target, tok) =>
  GET(`op=affordances&token=${tok}&target=${encodeURIComponent(target)}`);
const actIds = (r) => (r?.acts ?? []).map((a) => a.id).sort();
const mdOf = async (id, tok) =>
  (await GET(`op=file&token=${tok}&id=${encodeURIComponent(id)}&path=bundle.md`))?.content
  ?? (await GET(`op=image&token=${tok}&id=${encodeURIComponent(id)}`))?.["bundle.md"];
const fmOf = async (id, tok) => parseFrontmatter(await mdOf(id, tok)).data || {};
const strengthOf = async (id, tok) => GET(`op=inquirystrength&token=${tok}&id=${encodeURIComponent(id)}`);
/* The composed pair as two readable words, which is what every arithmetic
   assertion below compares — `unrated` and `undetermined` are DIFFERENT facts
   and neither is a grade (D-160, REC-42), so the state is carried, never
   flattened into a letter. */
const pair = (s) => [s?.capture?.state === "graded" ? s.capture.grade : s?.capture?.state,
                     s?.connection?.state === "graded" ? s.connection.grade : s?.connection?.state];

/* ------------------------------------------------------------------ fixture */

const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-rec45",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const CAROL = await enrol("carol", "admin", ["contribute", "publish"]);
/* An ADMINISTRATOR because membership section 4 requires the second member of a
   group to be one (ADMINS_FIRST) — nothing in this suite turns on the role. */
const RUTH = await enrol("ruth", "admin", ["contribute"]);
/* No `contribute`: the capability layer refuses before the store is reached. */
const VIEWONLY = await enrol("vic", "member", []);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* THE ATTRIBUTION THE CALLER TRIES TO HAND US. A perfectly well-formed member
   name that belongs to nobody, and a perfectly well-formed timestamp from six
   years before the act — which is exactly why REC-42's gate cannot catch it and
   why the stamp has to be the server's. */
const MALLORY = "mallory", BACKDATE = "2020-01-01T00:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
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
const groundLines = (rows) => rows === null ? [] : rows.length
  ? ["grounds:", ...rows.flatMap((r) => [`  - ground: ${r.ground}`,
      ...(r.by === null ? [] : [`    asserted_by: ${r.by ?? "carol"}`]),
      ...(r.at === null ? [] : [`    at: "${r.at ?? NOW}"`])])]
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
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
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

const CH_CAP = "INFO-2026-1000-charter-cap", CH_CON = "INFO-2026-1000-charter-con";
const CO_CAP = "INFO-2026-1000-code-cap", CO_CON = "INFO-2026-1000-code-con";
for (const d of [CH_CAP, CH_CON, CO_CAP, CO_CON]) await mustPromote(d, infoMd(d), "information");

/* THE FIXTURE THAT MAKES THE ACT FALSIFIABLE, REC-42's exactly:
     charter (legs 0,1):  capture B, connection C
     code    (legs 2,3):  capture C, connection A
   MIN within, MAX across -> capture B (charter), connection A (code).
   The FLAT rule reads capture C and connection C. So the two rules disagree on
   BOTH axes and the two axes are set by DIFFERENT groups, which is what makes
   "the act reached the arithmetic" a measurement rather than a hope. */
const HUNCH = { author: "carol", date: "2026-08-04" };
const g = (target, grade, axis, source = axis === "capture" ? "capture" : "hunch") =>
  ({ target, role: "supports", grade, axis, source, ...(source === "hunch" ? HUNCH : {}) });
const FOUR = [g(CH_CAP, "B", "capture"), g(CH_CON, "C", "connection"),
              g(CO_CAP, "C", "capture"), g(CO_CON, "A", "connection")];
const TWO_GROUPS = [{ ground: "charter", legs: [0, 1] }, { ground: "code", legs: [2, 3] }];

const INQ_A = "INQ-2026-1000-first", INQ_B = "INQ-2026-1000-discard",
      INQ_C = "INQ-2026-1000-gates", INQ_D = "INQ-2026-1000-remove",
      INQ_BARE = "INQ-2026-1000-bare", INQ_PUB = "INQ-2026-1000-published",
      INQ_DIV = "INQ-2026-1000-divided";
for (const id of [INQ_A, INQ_B, INQ_C, INQ_D, INQ_PUB, INQ_DIV])
  await mustPromote(id, inquiryMd(id, { refs: FOUR.map((l) => l.target), legs: FOUR }), "inquiry");
await mustPromote(INQ_BARE, inquiryMd(INQ_BARE), "inquiry");

/* ======================= 1. FIRST AUTHORSHIP, AND IT REACHES THE ARITHMETIC */
console.log("\n--- 1. op=inquiryground authors the structure, and the composed pair moves ---");
{
  const before = await strengthOf(INQ_A, CAROL);
  t("BEFORE the act the four legs are UNSTRUCTURED and read weakest-leg on both axes",
    pair(before), ["C", "C"]);
  t("an unstructured axis carries no per-group breakdown at all (REC-42's clause 2, unchanged here)",
    [before.capture.grounds ?? null, before.connection.grounds ?? null], [null, null]);
  t("op=affordances publishes the act on a question that rests on something",
    actIds(await affordances(INQ_A, CAROL)).includes("inquiryground"), true);

  const r = await ground(CAROL, { target: INQ_A, grounds: TWO_GROUPS });
  t("a FIRST grouping needs no reason: there is no earlier structure for it to be a revision of",
    [r.ok, r.act, r.reason], [true, "authored", null]);
  t("the act reports it grouped, over the legs it was given",
    [r.grouped, r.legs, r.grounds.map((x) => x.ground), r.grounds.map((x) => x.legs)],
    [true, 4, ["charter", "code"], [[0, 1], [2, 3]]]);
  t("asserted_by is the SESSION member on every group, and nothing is carried forward on a first authorship",
    [r.grounds.map((x) => x.asserted_by), r.grounds.map((x) => x.carried_forward)],
    [["carol", "carol"], [false, false]]);
  t("`at` is a server ISO timestamp on every group",
    r.grounds.every((x) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(x.at)), true);

  const after = await strengthOf(INQ_A, CAROL);
  t("AND THE PAIR MOVED: MAX over groups, MIN within, per axis, set by DIFFERENT groups",
    pair(after), ["B", "A"]);
  t("each axis now names the group that carries it",
    [after.capture.grounds.find((x) => x.grade === "B")?.ground,
     after.connection.grounds.find((x) => x.grade === "A")?.ground], ["charter", "code"]);
  t("the act returns the pair BEFORE and AFTER — DEC-32 clause 6's noticing material, recorded not judged",
    [pair(r.strength.before), pair(r.strength.after)], [["C", "C"], ["B", "A"]]);

  const md = await mdOf(INQ_A, CAROL);
  t("the partition is IN THE BYTES: every leg carries its group",
    (md.match(/^ {4}ground: (\S+)$/gm) || []).map((s) => s.trim()),
    ["ground: charter", "ground: charter", "ground: code", "ground: code"]);
  const fm = await fmOf(INQ_A, CAROL);
  t("and the attributed grounds[] block is beside it, one row per label",
    fm.grounds.map((x) => [x.ground, x.asserted_by]), [["charter", "carol"], ["code", "carol"]]);
  t("the Session Log records the act, the member, and the pair AS IT STOOD BEFORE IT",
    [/### Session .* \| Grouped \| carol/.test(md),
     /Trigger: op=inquiryground on INQ-2026-1000-first/.test(md),
     /Strength before: capture C, connection C\./.test(md),
     /First grouping: no earlier structure to revise\./.test(md)], [true, true, true, true]);
  t("NO STATE MOVED — grouping authors what a question rests on, not where it stands",
    (await fmOf(INQ_A, CAROL)).current_state, "open");
}

/* ============ 2. THE ATTRIBUTION IS THE SERVER'S AND A CALLER'S IS DISCARDED */
console.log("\n--- 2. a caller's asserted_by/at are DISCARDED, not overridden (the item's own control) ---");
{
  const r = await ground(CAROL, { target: INQ_B, grounds: [
    { ground: "charter", legs: [0, 1], asserted_by: MALLORY, at: BACKDATE },
    /* And a MACHINE asserter, which REC-42's gate refuses when a document
       carries one — offered here to prove the act never gets far enough to be
       refused, because the field is never read from the caller at all. */
    { ground: "code", legs: [2, 3], asserted_by: "token:member", at: BACKDATE }] });
  t("the act succeeds and the returned rows carry the SESSION member, never the caller's name",
    [r.ok, r.grounds.map((x) => x.asserted_by)], [true, ["carol", "carol"]]);
  t("nor the caller's date",
    r.grounds.some((x) => x.at === BACKDATE), false);

  const md = await mdOf(INQ_B, CAROL);
  t("THE CALLER'S NAME IS NOWHERE IN THE BYTES — discarded, not merely outvoted",
    md.includes(MALLORY), false);
  t("nor is the caller's backdate, which REC-42's gate would have accepted as a perfectly good ISO timestamp",
    md.includes(BACKDATE), false);
  t("nor is the machine asserter the caller offered",
    md.includes("token:member"), false);
  const fm = await fmOf(INQ_B, CAROL);
  t("what the document holds is the server's stamp on both rows",
    fm.grounds.map((x) => x.asserted_by), ["carol", "carol"]);
  t("and both dates are the act's own, within the ISO grammar the gate requires",
    fm.grounds.every((x) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(x.at) && x.at !== BACKDATE), true);
  t("the structure still landed, so the discard is not the act quietly failing",
    pair(await strengthOf(INQ_B, CAROL)), ["B", "A"]);
}

/* ================================= 3. RESTRUCTURE: THE REASON AND WHAT CARRIES */
console.log("\n--- 3. a RESTRUCTURE takes a reason; a first authorship does not; and the date says which ---");
{
  const first = (await fmOf(INQ_A, CAROL)).grounds;
  const CHARTER_AT = first.find((x) => x.ground === "charter").at;

  const bare = await ground(RUTH, { target: INQ_A,
    grounds: [{ ground: "charter", legs: [0, 1] }, { ground: "code", legs: [2] },
              { ground: "spare", legs: [3] }] });
  t("changing a structure that already exists is refused WITHOUT a reason, by name",
    [bare.ok, bare.reason, bare.restructure], [false, "NO_REASON", true]);
  t("and nothing moved: the standing structure is exactly what it was",
    (await fmOf(INQ_A, CAROL)).grounds.map((x) => x.ground), ["charter", "code"]);

  const WHY = "the connection leg is not load-bearing for the code reading, so it stands on its own.";
  const r = await ground(RUTH, { target: INQ_A, reason: WHY,
    grounds: [{ ground: "charter", legs: [0, 1] }, { ground: "code", legs: [2] },
              { ground: "spare", legs: [3] }] });
  t("with a reason it is RECORDED and ATTRIBUTED — never blocked (DEC-32 clause 6)",
    [r.ok, r.act, r.reason, r.asserted_by], [true, "restructured", WHY, "ruth"]);
  t("a group whose legs did NOT move keeps the name and the date it already had: the assertion is about the legs",
    [r.grounds[0].ground, r.grounds[0].carried_forward, r.grounds[0].asserted_by, r.grounds[0].at === CHARTER_AT],
    ["charter", true, "carol", true]);
  t("a group whose membership MOVED becomes THIS member's assertion, now",
    [r.grounds[1].ground, r.grounds[1].carried_forward, r.grounds[1].asserted_by],
    ["code", false, "ruth"]);
  t("and a new group is this member's too",
    [r.grounds[2].ground, r.grounds[2].carried_forward, r.grounds[2].asserted_by],
    ["spare", false, "ruth"]);
  t("the document holds both attributions side by side, which is the only thing that lets a reader tell "
    + "a structure authored before a strength was seen from one authored after it",
    (await fmOf(INQ_A, CAROL)).grounds.map((x) => x.asserted_by), ["carol", "ruth", "ruth"]);
  const md = await mdOf(INQ_A, CAROL);
  t("the reason and the prior pair are in the Session Log, where an append-only history keeps them",
    [/### Session .* \| Restructured \| ruth/.test(md), md.includes(`Reason: ${WHY}`),
     /Strength before: capture B, connection A\./.test(md)], [true, true, true]);
  t("re-authoring the SAME partition is refused: a revision that changes nothing would record a "
    + "restructuring that did not happen",
    (await ground(RUTH, { target: INQ_A, reason: "again",
      grounds: [{ ground: "charter", legs: [0, 1] }, { ground: "code", legs: [2] },
                { ground: "spare", legs: [3] }] })).reason, "PARTITION_UNCHANGED");
}

/* ============================================= 4. WHO MAY, AND WHO IS REFUSED */
console.log("\n--- 4. a machine credential is refused BY NAME; contribute is the gate and no new token is minted ---");
{
  t("a MEMBER_TOKEN machine credential REACHES the act and is refused by name, not by absence",
    (await ground("mem-rec45", { target: INQ_C, grounds: TWO_GROUPS })).reason, "MACHINE_CANNOT_GROUND");
  t("an ADMIN_TOKEN machine credential is refused identically — the rule is about who the caller IS",
    (await ground("adm-rec45", { target: INQ_C, grounds: TWO_GROUPS })).reason, "MACHINE_CANNOT_GROUND");
  t("a member session WITHOUT contribute is refused at the capability layer, before the store is reached",
    (await ground(VIEWONLY, { target: INQ_C, grounds: TWO_GROUPS })).reason, "NOT_CAPABLE");
  t("and the question is still unstructured after all three",
    (await fmOf(INQ_C, CAROL)).grounds ?? null, null);
  t("no NEW capability token: the act rides contribute, which op=affordances publishes",
    (await affordances(INQ_C, CAROL)).acts.find((a) => a.id === "inquiryground")?.needs, "contribute");
}

/* ======================== 5. ONE GRAMMAR, THE SAME ONE, AT BOTH GATES */
console.log("\n--- 5. every REC-42 refusal fires through the ACT and through op=promote, with the SAME message ---");
{
  /* Each case is driven twice: once as a partition handed to the act, once as a
     HAND-WRITTEN document handed to op=promote. The check id and the message
     string are compared, because "one function at both gates" is a claim about
     the words a member is given and not only about which module a call lands
     in. A second grammar written inside the act would pass an id comparison and
     fail this one. */
  const viaAct = async (grounds) => {
    const r = await ground(CAROL, { target: INQ_C, grounds });
    return [r.reason, (r.findings || []).map((f) => [f.check, f.detail])];
  };
  const viaPromote = async (n, legs, rows) => {
    const id = `INQ-2026-1000-hand${n}`;
    const r = await promote(id, inquiryMd(id, { refs: FOUR.map((l) => l.target), legs, grounds: rows }), "inquiry");
    return [r.reason, (r.findings || []).map((f) => [f.check, f.detail])];
  };
  const withGround = (byOrd) => FOUR.map((l, i) => (byOrd[i] ? { ...l, ground: byOrd[i] } : l));

  const bad = await viaAct([{ ground: "no:colons", legs: [0, 1, 2, 3] }]);
  t("(a) A LABEL THE GRAMMAR REFUSES — the act refuses it under op=promote's own reason name",
    bad[0], "BASIS_REFUSED");
  t("(a) and the finding is byte-identical to the one op=promote gives for the same document",
    bad[1], (await viaPromote("a", withGround(["no:colons", "no:colons", "no:colons", "no:colons"]),
      [{ ground: "no:colons" }]))[1]);

  const dup = await viaAct([{ ground: "charter", legs: [0, 1] }, { ground: "charter", legs: [2, 3] }]);
  t("(b) A LABEL DECLARED TWICE — one group, one assertion, one member answering for it",
    [dup[0], dup[1].length > 0], ["BASIS_REFUSED", true]);
  t("(b) same finding from both gates",
    dup[1], (await viaPromote("b", withGround(["charter", "charter", "charter", "charter"]),
      [{ ground: "charter" }, { ground: "charter" }]))[1]);

  const empty = await viaAct([{ ground: "charter", legs: [0, 1, 2, 3] }, { ground: "code", legs: [] }]);
  t("(c) A GROUP NO LEG BELONGS TO — a partition of the legs cannot have an empty part",
    [empty[0], empty[1].length > 0], ["BASIS_REFUSED", true]);
  t("(c) same finding from both gates",
    empty[1], (await viaPromote("c", withGround(["charter", "charter", "charter", "charter"]),
      [{ ground: "charter" }, { ground: "code" }]))[1]);

  const half = await viaAct([{ ground: "charter", legs: [0, 1] }]);
  t("(d) A HALF-LABELLED BASIS — grouped WHOLE or not at all, because a leg nobody grouped beside "
    + "groups somebody did is a relationship the record would have to guess at",
    [half[0], half[1].length > 0], ["BASIS_REFUSED", true]);
  t("(d) same finding from both gates",
    half[1], (await viaPromote("d", withGround(["charter", "charter", null, null]),
      [{ ground: "charter" }]))[1]);

  t("and after all four the question is STILL unstructured — every refusal fired before anything moved",
    [(await fmOf(INQ_C, CAROL)).grounds ?? null, pair(await strengthOf(INQ_C, CAROL))], [null, ["C", "C"]]);

  /* THE TWO REFUSALS THE DOCUMENT CANNOT EXPRESS, and which therefore belong to
     the act rather than to the catalog: a partition addresses legs by ORDINAL
     (REC-16's apportionment decision, for D4's reason — one document
     legitimately carries two legs), and an ordinal is a thing a document has no
     way to get wrong. */
  t("an ordinal that addresses no leg is refused, and says what the legs are",
    (await ground(CAROL, { target: INQ_C, grounds: [{ ground: "charter", legs: [0, 9] }] })).reason,
    "BAD_PARTITION");
  const twice = await ground(CAROL, { target: INQ_C,
    grounds: [{ ground: "charter", legs: [0, 1] }, { ground: "code", legs: [1, 2, 3] }] });
  t("one leg claimed by two groups is refused, naming both",
    [twice.reason, twice.ord, twice.claimed_by], ["BAD_PARTITION", 1, ["charter", "code"]]);
  t("a group naming no legs array at all is refused",
    (await ground(CAROL, { target: INQ_C, grounds: [{ ground: "charter" }] })).reason, "BAD_PARTITION");
  t("an omitted partition is refused BY NAME, and the refusal says how to REMOVE one",
    (await ground(CAROL, { target: INQ_C })).reason, "NO_PARTITION");
  t("a statement carrying a quote is refused: the restricted frontmatter grammar has no escapes",
    (await ground(CAROL, { target: INQ_C, grounds: [
      { ground: "charter", legs: [0, 1, 2, 3], statement: 'the "charter" alone carries it' }] })).reason,
    "BAD_STATEMENT");
  t("a reason carrying a newline is refused for the same reason",
    (await ground(CAROL, { target: INQ_A, reason: "line\nbreak",
      grounds: [{ ground: "charter", legs: [0, 1, 2, 3] }] })).reason, "BAD_REASON");
}

/* ============================================ 6. PUBLISHED BY op=affordances */
console.log("\n--- 6. op=affordances publishes the act, its prompt, and no analyst vocabulary ---");
{
  const a = (await affordances(INQ_A, CAROL)).acts.find((x) => x.id === "inquiryground");
  t("the act is published with the metadata every act carries",
    [a.weight, a.needs, a.mode, a.rung], ["single", "contribute", "session", null]);
  t("THE PROMPT RIDES THE ACT (DEC-29(b)): a surface that has the control necessarily has the wording",
    typeof a.prompt === "string" && a.prompt.length > 100, true);
  /* Clause by clause, the REC-16 discipline: each sentence is a fact about what
     this plane DOES, so the suite holds the wording to the mechanism rather
     than to somebody's memory of it. */
  t("clause 1 — what the assertion MEANS, in the words checkGrounds' own refusal already uses",
    /enough on their own to carry your answer/.test(a.prompt), true);
  t("clause 2 — the MAX composition, stated as the consequence a member is choosing",
    /strongest group rather than from its weakest single reason/.test(a.prompt), true);
  t("clause 3 — the name and the time go on it, and stay until the group's reasons change",
    /your name and the time go on each group you make and stay there until that group's reasons change/
      .test(a.prompt), true);
  t("clause 4 — nothing is hidden, and the reader can check it in the signed bytes",
    /published case carries each group and what it reached inside the signed bytes/.test(a.prompt), true);
  t("clause 5 — the conservative escape is always available and is what an ungrouped basis reads as",
    /ungrouped is always available, and is read as no stronger than the weakest one/.test(a.prompt), true);
  /* DEC-32 clause 1 is binding on any member-facing string: NEVER show AND, OR,
     disjunction or grounds — not even as a tooltip. The wire name is
     `inquiryground` because a wire name is not a surface; the LABEL and the
     PROMPT are what a member reads, and they are held to the rule here. */
  t("and NO ANALYST VOCABULARY reaches the member-facing strings (DEC-32 clause 1)",
    [/\bground/i.test(a.prompt), /\bdisjunct/i.test(a.prompt), /\bbranch/i.test(a.prompt),
     /\bground/i.test(a.label), /\b(AND|OR)-related\b/.test(a.prompt)],
    [false, false, false, false, false]);
  t("the no-target catalogue carries it too, with the same prompt",
    (await GET(`op=affordances&token=${CAROL}`)).catalog.find((x) => x.id === "inquiryground")?.prompt,
    a.prompt);
}

/* ================================== 7. REMOVING THE GROUPING, AND THE STATES */
console.log("\n--- 7. removing a grouping is a restructure; and the states that refuse it by name ---");
{
  await ground(CAROL, { target: INQ_D, grounds: TWO_GROUPS });
  t("INQ_D is grouped and composing by maximum", pair(await strengthOf(INQ_D, CAROL)), ["B", "A"]);
  t("removing it with NO reason is refused: it changes an authored structure like any other change",
    (await ground(CAROL, { target: INQ_D, grounds: [] })).reason, "NO_REASON");
  const off = await ground(CAROL, { target: INQ_D, grounds: [],
    reason: "these were never independently sufficient; I grouped them before I had the second document." });
  t("removing it WITH a reason is recorded and attributed",
    [off.ok, off.act, off.grouped, off.grounds], [true, "restructured", false, []]);
  const md = await mdOf(INQ_D, CAROL);
  t("the document is returned to the UNGROUPED shape — no grounds key, no ground line, not an EMPTY block",
    [/^grounds:/m.test(md), / {4}ground:/.test(md)], [false, false]);
  t("and the answer reads as its weakest leg again, which is the conservative reading",
    pair(await strengthOf(INQ_D, CAROL)), ["C", "C"]);
  t("an axis that is ungrouped again carries no per-group breakdown either",
    (await strengthOf(INQ_D, CAROL)).capture.grounds ?? null, null);

  t("a question resting on NOTHING is refused BY NAME: a partition is a partition OF THE LEGS",
    (await ground(CAROL, { target: INQ_BARE, grounds: [] })).reason, "NO_BASIS");
  t("op=affordances does not publish the act there either — the publication and the refusal agree (DEC-8)",
    actIds(await affordances(INQ_BARE, CAROL)).includes("inquiryground"), false);
  t("an INFORMATION bundle is refused: only a question rests on a basis",
    (await ground(CAROL, { target: CH_CAP, grounds: [] })).reason, "NOT_AN_INQUIRY");
  t("a question the viewer cannot see is refused as an ABSENT one, disclosing nothing",
    (await ground(RUTH, { target: "INQ-2026-9999-nope", grounds: [] })).reason, "NO_SUCH_BUNDLE");

  /* PUBLISHED. The pair and the per-group breakdown are inside signed, ratified
     bytes; re-cutting the partition underneath them would leave the document
     composing to something the edition on the record contradicts. */
  await GET(`op=conclude&token=${CAROL}&target=${INQ_PUB}`
    + `&conclusion=${encodeURIComponent("The transfer rested on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer.")}`);
  /* REC-44 / DEC-44 (2026-08-04): `scope` is authored per case per edition and
     required. Nothing else in this block moves — a published case still refuses
     restructuring by name, at whatever arity the case has. */
  const pub = await POST(`op=publish&token=${CAROL}`, { target: INQ_PUB,
    scope: "Whether the FY2024 transfer rested on anything the Council adopted.",
    statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
    excluded: [], subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed the reply." });
  t("(fixture) INQ_PUB published at edition 1", [pub.ok, pub.edition], [true, 1]);
  t("a PUBLISHED case refuses restructuring BY NAME, and the refusal names DEC-12's route",
    (await ground(CAROL, { target: INQ_PUB, grounds: TWO_GROUPS })).reason, "PUBLISHED_CANNOT_RESTRUCTURE");
  t("and op=affordances does not offer the control the refusal would decline",
    actIds(await affordances(INQ_PUB, CAROL)).includes("inquiryground"), false);

  /* DIVIDED. The parent was declared malformed and carried forward into
     children that supersede it; re-deriving its strength moves a number its
     children's own disclosure already points at. */
  const KID_A = "INQ-2026-1000-kid-a", KID_B = "INQ-2026-1000-kid-b";
  const div = await POST(`op=inquirydivide&token=${CAROL}&target=${INQ_DIV}`, {
    reason: "these were two questions: the charter reading and the code reading.",
    children: [{ id: KID_A, question: "What does the charter permit here?", legs: [0, 1] },
               { id: KID_B, question: "What does the code permit here?", legs: [2, 3] }] });
  t("(fixture) INQ_DIV divided into two children", [div.ok, div.to], [true, "divided"]);
  t("a DIVIDED parent refuses restructuring BY NAME, and points at the child that carries the half",
    (await ground(CAROL, { target: INQ_DIV, grounds: TWO_GROUPS })).reason, "DIVIDED_CANNOT_RESTRUCTURE");
  t("and op=affordances does not offer it on a terminal parent",
    actIds(await affordances(INQ_DIV, CAROL)).includes("inquiryground"), false);
  t("a CHILD, which is where the restructuring belongs, does offer it",
    actIds(await affordances(KID_A, CAROL)).includes("inquiryground"), true);
}

/* ========== 8. THE CONSEQUENCE THIS ACT INHERITS, MEASURED RATHER THAN GUESSED */
console.log("\n--- 8. a grouped question and a NEW leg: what op=cite does today, driven and recorded ---");
{
  /* A FINDING, REPORTED TO CONDUCT AND NOT FIXED HERE, asserted so the next
     worker meets it as a measurement instead of as a surprise. REC-42's
     partition is TOTAL OR ABSENT, and op=cite appends a leg with no group — so
     once a question is grouped, citing another document into it is refused at
     the write by the very rule that keeps the partition honest. That is not
     obviously wrong (a new leg genuinely has to be told where it belongs, and
     silently defaulting it either way would decide something the member did
     not), and it is not obviously right either, because the member's next act
     is refused with no route named in the refusal.
     THE ROUTE EXISTS AND IT IS THIS ITEM'S: ungroup with a reason, cite, and
     group again — three attributed acts, all of them on the record, and the
     middle one only reachable BECAUSE this act was built. What is genuinely
     undecided is whether a new leg should default to NECESSARY (which the
     arithmetic already assumes for an unlabelled leg) or be refused as it is
     now, and that is doctrine rather than mechanism, so it is a DEC candidate
     and is reported as one. */
  const INQ_CITE = "INQ-2026-1000-cite", EXTRA = "INFO-2026-1000-extra";
  await mustPromote(EXTRA, infoMd(EXTRA), "information");
  await mustPromote(INQ_CITE, inquiryMd(INQ_CITE, { refs: FOUR.map((l) => l.target), legs: FOUR }), "inquiry");
  const sel = await POST(`op=select&token=${CAROL}`, { ids: [EXTRA] });
  const before = await GET(`op=cite&token=${CAROL}&project=${INQ_CITE}&handle=${sel.handle}&role=supports`);
  t("UNGROUPED, a new leg cites into the question normally", before.ok, true);

  await ground(CAROL, { target: INQ_CITE,
    grounds: [{ ground: "charter", legs: [0, 1] }, { ground: "code", legs: [2, 3, 4] }] });
  /* A GENUINELY NEW document. `op=cite` treats an already-cited member as
     alreadyCited and adds no leg, so citing one of the four back would have
     measured nothing — the first version of this block did exactly that and
     reported a pass that meant "no leg was added". */
  const EXTRA2 = "INFO-2026-1000-extra-two";
  await mustPromote(EXTRA2, infoMd(EXTRA2), "information");
  const sel2 = await POST(`op=select&token=${CAROL}`, { ids: [EXTRA2] });
  const after = await GET(`op=cite&token=${CAROL}&project=${INQ_CITE}&handle=${sel2.handle}&role=supports`);
  t("GROUPED, the SAME act is refused at the write by the total-or-absent rule — reported, not fixed",
    [after.ok, after.reason], [false, "BASIS_REFUSED"]);
  t("and the refusal is the catalog's own half-labelled finding, which is why it is a doctrine question "
    + "about defaults rather than a defect in either act",
    /carries no ground while|carry no ground while/.test((after.findings || []).map((f) => f.detail).join(" ")),
    true);
  const off = await ground(CAROL, { target: INQ_CITE, grounds: [],
    reason: "un-grouping to take in a document that bears on both readings." });
  const sel3 = await POST(`op=select&token=${CAROL}`, { ids: [EXTRA2] });
  const re = await GET(`op=cite&token=${CAROL}&project=${INQ_CITE}&handle=${sel3.handle}&role=supports`);
  t("THE ROUTE THROUGH IT IS THIS ACT: ungroup with a reason, cite, group again — every step attributed",
    [off.ok, re.ok,
     (await ground(CAROL, { target: INQ_CITE, reason: "re-grouping with the new document in the code reading.",
       grounds: [{ ground: "charter", legs: [0, 1] }, { ground: "code", legs: [2, 3, 4, 5] }] })).ok],
    [true, true, true]);
}

console.log(`\n${fail ? "FAIL" : "PASS"} inquiryground.test.mjs — ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
