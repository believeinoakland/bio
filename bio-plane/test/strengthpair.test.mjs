/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/strengthpair.control.mjs` — deliberately NOT a `.test.mjs` because it EDITS REAL SOURCES while it runs, so the battery must not discover it (`check-refusal-codes.mjs`'s precedent, PL-2/PL-3/PL-4's shape). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad: a worker's harness was overwritten mid-turn by a concurrent worker on 2026-08-07, and a harness silently replaced between ARM and RESTORE reports a restore it never performed. Every arm is armed ALONE against a whole tree, every restore is verified BY sha256 AND BY CONTENT, and every arm names the assertions that MUST fail AND the ones that MUST NOT. See that file's header for the MEASURED results — figures are not copied here, because a hand-carried number in a second file is the drift this repository has measured more often than any other defect.
   OWED CONTROL 3 IS DEC-40'S AND IT RUNS FIRST (design §18, IS-BUILD-PLAN VF-1(3)): produce a what-if rendering, STRIP its filter/state-set line, and the harness must FAIL. And beside it the item's own trap: COMPOSE THE TWO AXES INTO ONE VALUE ANYWHERE and DEC-44's refusal fires.
   THE SEVENTEEN ARMS, and every figure lives in the control file rather than here: (1a) strip DEC-40's filter line with the guard whole — nothing leaves at all; (1b) BOTH DEFENCES DOWN, which is PL-1's control (2) shape and the only arm that shows the HARM rather than the teeth; (1c) the machine-readable state set dropped; (1d) DEC-40's catalogue row renamed away. (2) COMPOSE the pair into one figure; (2b) the composition under a name the forbidden-key list did not predict, which is what proves the TOTALITY is doing the work; (2c) the guard removed while the builder stays honest — behaviour unchanged and only the pin can see it. (3) MIN over branches instead of MAX; (4) MAX within a branch instead of MIN. (5) hunches counted as evidence. (6) grades read off the FROZEN row instead of `earnedBasisRegistry`; (6b) the capture CEILING not applied. (7a) NAMED broken with INERT whole — every arithmetic arm stays green, which is why naming needs its own control; (7b) INERT broken with NAMED whole. (8) the arithmetic RE-IMPLEMENTED rather than reached through `legsOverride` — the shape that absorbed IS-6's C-22.4 control. (9) the state set defaulted to every state rather than to `accepted`. (10) OVER-STRICTNESS, which must PASS. */
/* IS-BUILD-PLAN PL-14 / IS-7 — THE STRENGTH PAIR OVER ONE VERSION.
 *
 * INVESTIGATIVE-SESSION.md §12, and its first sentence is a correction rather
 * than a description: *"STRENGTH IS A PAIR, AND THIS SECTION'S v2 SINGULAR WAS
 * THE REFUSED NUMBER (SWEEP C5). DEC-21/DEC-44 refuse the composition four
 * ways: strength is a pair over two populations — the capture axis and the
 * connection axis — never composed into one value."*
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *  1. THE PAIR IS NEVER COMPOSED INTO ONE NUMBER, AND IT IS ASSERTED RATHER
 *     THAN MERELY AVOIDED. The answer's `pair` holds EXACTLY the two axes —
 *     totality both ways, so a third key is caught even under a name nobody
 *     predicted — no top-level key can read as a summary of both, and the guard
 *     that enforces it is REACHED on every successful return (pinned over
 *     comment-stripped real source, and the reader RE-RUN over a source that
 *     DOES compose and required to find it). DEC-44 refuses this composition one
 *     altitude UP for the same reason; this is the same refusal one altitude
 *     down.
 *
 *  2. DEC-32'S ARITHMETIC, OVER A MIXED FIXTURE, AND ALL THREE RULES SEPARATELY.
 *     MAX over the branches, MIN within a branch, per axis — asserted at the
 *     AXIS and at each BRANCH, so a build that took the min over branches and a
 *     build that took the max within one fail at different assertions. The
 *     fixture is mixed on purpose: a fixture whose branches all agree cannot
 *     tell any of the three rules from any other.
 *
 *  3. THE TWO AXES ARE TWO POPULATIONS AND THE FIXTURE MAKES THEM DISAGREE.
 *     Capture reads one letter and connection another over the same version. A
 *     fixture where they coincide would let a single composed number pass every
 *     assertion in this file.
 *
 *  4. AN UNGRADED LEG IS INERT **AND** NAMED, and those are TWO FACTS that fail
 *     separately (DEC-18, and its plural clause: *"more than one leg may have no
 *     established grade, in which case every such leg will be named"*). INERT is
 *     what the arithmetic does; NAMED is what the reader is owed. The control
 *     breaks them one at a time.
 *
 *  5. A HUNCH DOES NOT COUNT AS EVIDENCE (§12) AND THE EXCLUSION IS DOING WORK.
 *     The hunch leg's document EARNS a real grade — asserted from the registry
 *     itself — so the branch it sits in reads UNRATED because the hunch was
 *     excluded and not because there was nothing there. An exclusion arm over a
 *     leg that would have earned nothing passes vacuously.
 *
 *  6. GRADES ARRIVE FROM `earnedBasisRegistry` AND ARE NEVER MINTED. The letter
 *     reported is the letter `op=earnedbasis` reports — DRIVEN from that op, not
 *     typed — a frozen row claiming MORE than the record earns is reported at
 *     what the record earns, and the capture axis is CAPPED at the ceiling
 *     because the ceiling is a bound and not a measurement.
 *
 *  7. THE STATE-SET ARGUMENT DEFAULTS TO ACCEPTED, and §6 rule 6's exploration
 *     is CALCULATING OVER an unaccepted reading — never making it current. The
 *     refusal names the widening rather than being a dead end.
 *
 *  8. THE RETURN CARRIES THE STATE SET THAT PRODUCED IT, IN BAND (DEC-40 det. 2,
 *     transplanted by §12: *"A what-if pair carries its state-set line wherever
 *     it renders"*). Every answer carries it, including the unfiltered one,
 *     because *"absence of the line becomes the ambiguity"*.
 *
 *  9. M9'S ACCEPTANCE SENTENCE, WITH ITS STATE WORD CORRECTED AND THE CORRECTION
 *     STATED. See block 8's header: the behaviour M9 describes is asserted in
 *     BOTH states the plane actually has, each over the facts that produce it.
 *
 * NO MEMBER-FACING STRING IN THIS ITEM SAYS "ground", "partition", "AND" or
 * "OR" as a member-facing word (DEC-32's elicitation clause 1, D-226), and
 * block 9 asserts that of every canned translation directly.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { VERSION_STRENGTH_CHECKS, VERSION_STRENGTH_DEFAULT_STATES,
         VERSION_STRENGTH_INERT_SOURCES, VERSION_STATES, VERSION_MACHINE,
         BASIS_GRADES, EARNED_CAPTURE_CEILING } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT READS throughout (PL-1's discipline): an arm that throws on
   `.pair.capture.grade` of undefined takes every arm behind it with it and
   reports one defect as none. */
const axis = (r, a) => (r && r.pair && r.pair[a]) ? r.pair[a] : {};
/* THE DEC-40 LINE AND A CATALOGUE ROW, READ TOLERANTLY. A control that DELETES
   the line or RENAMES a row must make an ASSERTION fail — not make this file
   throw, which is D-93's class and would take every arm behind it. Both were
   caught by the control's first run and are corrected here rather than smoothed:
   the arms are the reason the tolerance exists. */
const line = (r) => (r && typeof r.filter === "string") ? r.filter : "";
const chk = (k) => VERSION_STRENGTH_CHECKS[k] ?? {};
const groundOf = (r, a, g) => (axis(r, a).grounds ?? []).find((x) => x.ground === g) || {};
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
const count = (hay, needle) => hay.split(needle).length - 1;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl14", MEMBER_TOKEN: "mem-pl14", PROBE_TOKEN: "prb-pl14", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-pl14",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? []
  : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  if (versions === null) return [];
  const rows = versions.map((v) => ["  - name: \"" + v.name + "\"",
    ...scalar("description", v.description),
    ...scalar("relationship", v.relationship),
    ...scalar("state", v.state === undefined ? "suggested" : v.state),
    ...scalar("derived_from", v.derived_from === undefined ? null : v.derived_from),
    ...scalar("hidden", v.hidden === undefined ? false : v.hidden),
    ...scalar("author", v.author === undefined ? "ruth" : v.author),
    ...scalar("at", v.at === undefined ? NOW : v.at),
    ...scalar("state_by", v.state_by), ...scalar("state_at", v.state_at),
    ...scalar("state_reason", v.state_reason)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ["  - version: \"" + v.name + "\"", ...scalar("ground", g),
     ...scalar("asserted_by", "ruth"), ...scalar("at", NOW)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ["  - version: \"" + v.name + "\"", ...scalar("target", l.target),
     ...scalar("role", l.role === undefined ? "supports" : l.role),
     ...scalar("ground", l.ground),
     ...scalar("grade", l.grade), ...scalar("grade_axis", l.axis),
     ...scalar("grade_source", l.source)].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const basisLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`])]
  : [];
const inquiryMd = (id, { question = `What does ${id} rest on?`, subject = null, refs = [],
                         versions = null, basis = [] } = {}) => ["---",
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
  ...(subject ? [`subject_entity: ${subject}`] : []),
  ...basisLines(basis),
  ...versionLines(versions),
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
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (id, refs = []) => ["---", `id: ${id}`, "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - rel: cites`,
      `    status: confirmed`, `    target: ${x}`])] : ["references: []"]),
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type, { base = null, register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return POST(`op=promote&token=${RUTH}`, {
    bundleId: id, base,
    snapKey: `20260804T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
};
const mustPromote = async (id, ...a) => {
  const r = await promote(id, ...a);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 900)}`);
  return r;
};
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const strength = async (qs, tok = RUTH) =>
  GET(`op=versionstrength&token=${tok}&${qs}`);

console.log("--- 0. the ground: a registered subject, and documents that earn different letters ---");

/* THE SUBJECT the whole connection axis is measured against. Its alias is a
   COMPOSITE KEY, so a document referencing that exact key earns grade A — the
   strongest rung of framework §8.1 and the one no fixture can fake. */
const eOrd = await POST(`op=entitycreate&token=${RUTH}`,
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:13579"] });
const ORD = eOrd.entity_id;
t("a subject is registered and the axis has something to be measured against",
  typeof ORD === "string" && ORD.startsWith("ENT-"), true);

const DOC_A1 = "INFO-2026-3000-ordinance-a";
const DOC_A2 = "INFO-2026-3000-second-record";
const DOC_C1 = "INFO-2026-3000-name-only";
const DOC_BARE = "INFO-2026-3000-nothing-earned";
const DOC_HUNCH = "INFO-2026-3000-hunch-target";
const SHA = Object.fromEntries([DOC_A1, DOC_A2, DOC_C1, DOC_HUNCH].map((d) => [d, sha(`capture-of-${d}`)]));

const readingOf = (captureSha, entities) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
             at: NOW, entities } });
const byKey = { ref: "ordinance:13579", kind: "ordinance", key: "13579", label: "Ordinance No. 13579" };
/* A NAME correspondence and nothing more: kind and label match, the key does
   not. It can only ever reach C — an equality that costs nothing to produce is
   not evidence, which is why the fixture needs it. */
const byName = { ref: "ordinance:99999", kind: "ordinance", key: "99999",
                 label: "Sewer Fund Transfer Ordinance" };

for (const [d, ent] of [[DOC_A1, byKey], [DOC_A2, byKey], [DOC_C1, byName], [DOC_HUNCH, byKey]])
  await mustPromote(d, infoMd(d), "information", {
    reading: readingOf(SHA[d], [ent]),
    register: [{ path: "snapshots/d.bin", sha256: SHA[d], encoding: "binary", bytes: 10 }] });
/* NO capture, NO reading: the record holds this document's text and nothing
   about how any bytes arrived or what they concern. It earns nothing on either
   axis, which is what makes it the ungraded leg rather than a weak one. */
await mustPromote(DOC_BARE, infoMd(DOC_BARE), "information");

for (const d of [DOC_A1, DOC_A2, DOC_C1, DOC_HUNCH])
  await POST(`op=resolve&token=${RUTH}`, { captureSha: SHA[d] });

/* THE EARNED LETTERS, READ FROM THE REGISTRY'S OWN OP rather than assumed by
   this file. Every grade this suite later asserts is compared against THIS, so
   a fixture that stopped earning what it thinks it earns fails here first. */
const INQ = "INQ-2026-3000-sewer-transfers";
const PROJ = "PROJ-2026-3000-oversight";
await mustPromote(PROJ, projectMd(PROJ, [INQ]), "project");

const V_MIXED = {
  name: "the mixed reading", relationship: "or",
  description: "Two records either of which would carry the answer, one of them resting on a "
             + "second document, plus a leg nothing is earned for and a leg the member is only guessing at.",
  state: "accepted", state_by: "ruth", state_at: LATER,
  grounds: ["the ordinance record", "the second record", "the guess"],
  legs: [
    /* BRANCH 1 — two legs, both necessary within it, so the branch is worth the
       WEAKER of them. A (the key) beside C (the name) reads C if MIN-within is
       right and A if it is not. */
    { target: DOC_A1, ground: "the ordinance record", axis: "connection", source: "resolution", grade: "A" },
    { target: DOC_C1, ground: "the ordinance record", axis: "connection", source: "resolution", grade: "C" },
    /* and the leg that earns nothing at all: INERT and NAMED, in a branch that
       still carries a grade, so its inertness is visible as inertness rather
       than as an empty branch. */
    { target: DOC_BARE, ground: "the ordinance record", axis: "connection", source: "resolution" },
    /* BRANCH 2 — one leg at A. The axis reads A if MAX-over-branches is right
       and C if it is not, so branch 1 and branch 2 together separate the two
       rules that the single-branch case cannot. */
    { target: DOC_A2, ground: "the second record", axis: "connection", source: "resolution", grade: "A" },
    /* BRANCH 3 — a HUNCH, over a document that DOES earn A. The branch reads
       UNRATED only because the hunch was excluded; if hunches counted it would
       read A, so this arm cannot pass vacuously. */
    { target: DOC_HUNCH, ground: "the guess", axis: "connection", source: "hunch", grade: "A" },
    /* THE CAPTURE AXIS — its own population, its own letters, deliberately
       reaching a DIFFERENT answer from the connection axis. */
    { target: DOC_A1, ground: "the ordinance record", axis: "capture", source: "capture", grade: "B" },
    { target: DOC_A2, ground: "the second record", axis: "capture", source: "capture", grade: "C" },
  ],
};
await mustPromote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC_A1, DOC_A2, DOC_C1, DOC_BARE, DOC_HUNCH],
                                        versions: [V_MIXED] }), "inquiry");

/* `targets=` IS REQUIRED HERE AND THAT IS A MEASUREMENT RATHER THAN A
   PREFERENCE: `op=earnedbasis` defaults its target list to `inquiry_basis` —
   the FINDING layer's legs — and a question whose evidence lives only in
   VERSION legs has none of those, so the default answer is empty. Naming the
   targets is what makes this reader see the same population `op=versionstrength`
   composes over. Recorded because a suite comparing an empty registry against
   an empty registry would agree at zero cost. */
const earned = await GET(`op=earnedbasis&token=${RUTH}&id=${INQ}`
  + `&targets=${[DOC_A1, DOC_A2, DOC_C1, DOC_BARE, DOC_HUNCH].join(",")}`);
const earnedConn = (id) => earned?.earned?.connection?.[id]?.grade ?? null;
const earnedCap = (id) => earned?.earned?.capture?.[id]?.grade ?? null;
t("the registry earns A for the key match, C for the name match, and NOTHING for the bare document",
  [earnedConn(DOC_A1), earnedConn(DOC_C1), earnedConn(DOC_A2), earnedConn(DOC_BARE)],
  ["A", "C", "A", null]);
t("and the capture axis earns a CEILING, from the catalog and not from this file",
  [earnedCap(DOC_A1), earnedCap(DOC_BARE)], [EARNED_CAPTURE_CEILING, null]);
t("the hunch's document EARNS a real grade, so excluding it costs something and the arm cannot pass vacuously",
  earnedConn(DOC_HUNCH), "A");

/* ================ 1. THE PAIR IS NEVER COMPOSED INTO ONE NUMBER ========= */
console.log("\n--- 1. the pair is never composed into one number — asserted, not merely avoided ---");
{
  const r = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`);
  t("the pair answers", [r.ok, r.version, r.version_state], [true, V_MIXED.name, "accepted"]);
  /* AND IT IS AN ANSWER RATHER THAN A REFUSAL WEARING ONE'S SHAPE. This line
     exists so that when a control ARMS the composition or strips DEC-40's line,
     the C-NUMBER THAT FIRED IS PRINTED — an arm that only knows an assertion
     moved cannot say WHICH refusal did the moving, and "the refusal fires" is
     the thing PL-14 is judged on. */
  t("and it is an answer, not a refusal wearing an answer's shape — the code that fired is printed here",
    [r.ok, r.code ?? null, r.check ?? null], [true, null, null]);
  /* TOTALITY BOTH WAYS. Not "contains the two axes" — a check that a composed
     answer carrying a third key would pass. */
  t("`pair` holds EXACTLY the two axes and nothing else",
    Object.keys(r.pair ?? {}).sort(), ["capture", "connection"]);
  t("and no top-level key can read as one figure standing for both",
    ["strength", "grade", "score", "overall", "composed", "letter", "rating", "value"]
      .filter((k) => Object.prototype.hasOwnProperty.call(r, k)), []);
  /* THE FIXTURE MAKES THE TWO POPULATIONS DISAGREE, which is what stops a
     single composed number passing every other assertion in this file. */
  t("the two axes report DIFFERENT letters over the same reading — two measurements, two populations",
    [axis(r, "capture").grade, axis(r, "connection").grade, axis(r, "capture").grade === axis(r, "connection").grade],
    ["B", "A", false]);
  /* CORRECTED AFTER ITS FIRST RUN, and the correction is the finding rather than
     a tidy-up: this arm first asserted the two axes hold DIFFERENT POPULATION
     SIZES and it was wrong about the model. `#strengthWalk` admits every leg to
     BOTH axes and grades it on the one it is recorded on (R2-b), so the two
     populations are the same SIZE by construction and differ in WHO IS LOAD
     BEARING — *"a leg carrying a connection grade is inert on capture and says
     so; that is not a defect, it is the two populations being two."* The
     load-bearing counts are what actually separate them, so that is what is
     asserted, and the equal populations are asserted too so the model is pinned
     rather than assumed. */
  t("the two axes hold the same legs and DIFFERENT load-bearing members — the two populations being two",
    [axis(r, "capture").population === axis(r, "connection").population,
     axis(r, "capture").load_bearing, axis(r, "connection").load_bearing], [true, 2, 3]);
}
{
  /* THE GUARD IS REACHED, pinned over comment-stripped REAL source rather than
     trusted: DEC-44's refusal is worth nothing if the return path can miss it. */
  const s = strip(STORE_SRC);
  t("`#refusePairComposed` is DEFINED once and REACHED on the way out — one definition, one call",
    [count(s, "#refusePairComposed(") - 1, /return this\.#refusePairComposed\(out\) \?\? out;/.test(s)],
    [1, true]);
  /* AND THE READER IS RE-RUN OVER A SOURCE THAT DOES COMPOSE, and required to
     find it. A walk that reports "no composition" over a corpus it cannot see
     is the failure this repository has measured more than once. */
  const composed = s.replace("pair: { capture: pair.capture, connection: pair.connection },",
    "pair: { capture: pair.capture, connection: pair.connection }, strength: \"B\",");
  const seesIt = (src) => /pair: \{ capture: [^}]*\},\s*strength:/.test(src);
  t("the same reader run over a source that DOES compose FINDS it — the walk is not blind",
    [seesIt(s), seesIt(composed)], [false, true]);
  t("and DEC-44's refusal is a CATALOGUE ROW with a canned translation, not a comment",
    [chk("VERSION_STRENGTH_COMPOSED").check,
     (chk("VERSION_STRENGTH_COMPOSED").translation ?? "").length > 40], ["C-30.7", true]);
}

/* ==================== 2. DEC-32'S ARITHMETIC, MIXED ===================== */
console.log("\n--- 2. DEC-32's arithmetic over a MIXED fixture: MAX over branches, MIN within one ---");
{
  const r = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`);
  /* RULE 1 — MIN WITHIN A BRANCH. A branch is an AND of its legs and is no
     stronger than the weakest of them: A beside C reads C. */
  t("MIN WITHIN A BRANCH: the branch holding an A leg and a C leg is worth C",
    [groundOf(r, "connection", "the ordinance record").state,
     groundOf(r, "connection", "the ordinance record").grade], ["graded", "C"]);
  t("and it NAMES the leg that sets it, so a reader is sent to the leg and not to the branch",
    groundOf(r, "connection", "the ordinance record").weakest?.target_id, DOC_C1);
  /* RULE 2 — MAX OVER BRANCHES. Each branch would carry the answer on its own,
     so the axis takes the strongest. MIN over branches would read C here. */
  t("MAX OVER BRANCHES: the axis takes the STRONGEST branch, which is A and not the C branch",
    [axis(r, "connection").state, axis(r, "connection").grade], ["graded", "A"]);
  t("the second branch is the one that sets it, at A",
    groundOf(r, "connection", "the second record").grade, "A");
  /* RULE 3 — PER AXIS. The capture axis composes over its own population by the
     same two rules and reaches a different answer. */
  t("PER AXIS: capture composes over ITS OWN population — B beside C across two branches reads B",
    [groundOf(r, "capture", "the ordinance record").grade,
     groundOf(r, "capture", "the second record").grade,
     axis(r, "capture").grade], ["B", "C", "B"]);
  t("the axis sentence names the branch that carries it and the weakest leg WITHIN that branch",
    [/STRONGEST/.test(axis(r, "connection").detail ?? ""),
     (axis(r, "connection").detail ?? "").includes(DOC_A2)], [true, true]);
}

/* ============ 3. UNGRADED LEGS ARE INERT **AND** NAMED ================== */
console.log("\n--- 3. an ungraded leg is INERT and NAMED — two facts, not one ---");
{
  const r = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`);
  const g = groundOf(r, "connection", "the ordinance record");
  /* INERT — what the arithmetic does. The bare leg sits in the branch that
     reads C; if it floored the branch the branch would be undetermined, and if
     it unrated it the branch would be unrated. It does neither (DEC-18). */
  /* THE BRANCH HOLDS FOUR MEMBERS ON THIS AXIS AND NOT THREE, which is the two-
     populations model and not an off-by-one: the branch's capture leg is admitted
     to the connection axis too and is inert there, exactly as R2-b requires. */
  t("INERT: the branch carrying an ungraded leg is still graded, at its weakest GRADED leg",
    [g.state, g.grade, g.population, g.load_bearing], ["graded", "C", 4, 2]);
  /* NAMED — what the reader is owed, and it is a separate fact that fails on
     its own. DEC-18's plural clause: every such leg is named, one or many — and
     the PLURAL is exercised here rather than described, because the branch names
     two legs for two different reasons. */
  const named = (g.not_load_bearing ?? []);
  t("NAMED, PLURALLY: both legs that are not load-bearing here are named, never dropped",
    named.map((m) => m.target_id), [DOC_BARE, DOC_A1]);
  /* THE TWO REASONS COME FROM TWO LAYERS AND THAT IS DELIBERATE, measured while
     writing this arm rather than assumed: `#strengthWalk` composes its own `why`
     for every member it builds, so a branch names a leg with the ARITHMETIC's
     reason (*"the leg carries no grade"*, *"the leg's grade is on the capture
     axis"*), which is what a reader checking the composition needs. WHICH
     ABSENCE it is — nothing earned, versus a hunch, versus no axis — is a fact
     about the RECORD and is published at the top level, because CLAUDE.md makes
     saying which absence a first-class obligation and the arithmetic cannot know
     it. Both are asserted, so neither layer can quietly stop saying its half. */
  t("the branch names each leg with the ARITHMETIC's reason, and they differ from each other",
    [/carries no grade/.test(named[0]?.why ?? ""),
     /grade is on the capture axis/.test(named[1]?.why ?? "")], [true, true]);
  t("and WHICH ABSENCE it is travels at the top level, where the record's own reason lives",
    /earned nothing connecting/.test(
      (r.ungraded ?? []).find((m) => m.target_id === DOC_BARE)?.why ?? ""), true);
  t("the answer ALSO publishes the ungraded legs at the top, so a surface need not walk two axes",
    (r.ungraded ?? []).map((m) => m.target_id).includes(DOC_BARE), true);
  t("every ungraded leg carries where it sits and what it was for — never a bare id",
    Object.keys((r.ungraded ?? []).find((m) => m.target_id === DOC_BARE) ?? {}).sort(),
    ["grade_axis", "grade_source", "ground", "ord", "role", "target_id", "why"]);
}

/* ==================== 4. A HUNCH DOES NOT COUNT ========================= */
console.log("\n--- 4. a hunch is visible as such and does not count as evidence (§12) ---");
{
  const r = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`);
  t("the branch resting only on a hunch is UNRATED — it rests on nothing established",
    groundOf(r, "connection", "the guess").state, "unrated");
  t("and that is the EXCLUSION doing the work: the same document earns A in the registry",
    [earnedConn(DOC_HUNCH), groundOf(r, "connection", "the guess").grade], ["A", null]);
  t("the hunch leg is NAMED as a hunch, at the top level and in its own branch",
    [(r.hunches ?? []).map((m) => m.target_id),
     (groundOf(r, "connection", "the guess").not_load_bearing ?? []).map((m) => m.target_id)],
    [[DOC_HUNCH], [DOC_HUNCH]]);
  t("with the reason saying WHICH kind of not-load-bearing this is, not merely that it is",
    /marked as a hunch/.test((r.hunches ?? [])[0]?.why ?? ""), true);
  t("the excluded set is read from the CATALOG's roster and this file holds no second copy",
    VERSION_STRENGTH_INERT_SOURCES, ["hunch"]);
  /* AND THE AXIS IS UNMOVED BY THE UNRATED BRANCH — an unrated branch is inert
     exactly as an ungraded leg is, one level up (DEC-18's pattern per DEC-32). */
  t("an unrated branch neither floors the axis nor unrates it — inert one level up",
    axis(r, "connection").grade, "A");
}

/* ========== 5. GRADES ARRIVE FROM earnedBasisRegistry, NEVER MINTED ===== */
console.log("\n--- 5. grades arrive from earnedBasisRegistry and are never minted ---");
{
  const r = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`);
  t("the answer says where its letters came from rather than leaving a reader to assume",
    [r.grades_from, r.subject_entity, r.subject_known], ["earnedBasisRegistry", ORD, true]);
  /* DRIVEN, NOT TYPED: the letter this op reports for a leg is compared against
     the letter op=earnedbasis reports for the same target. */
  t("every graded connection leg reports EXACTLY what op=earnedbasis reports for its target",
    [groundOf(r, "connection", "the ordinance record").weakest?.grade === earnedConn(DOC_C1),
     groundOf(r, "connection", "the second record").weakest?.grade === earnedConn(DOC_A2)],
    [true, true]);
}
{
  /* A FROZEN ROW CLAIMING MORE THAN THE RECORD EARNS. §12: a frozen version
     freezes the COMPOSITION and the grade-REFERENCES — not the grades. So the
     stored letter is a reference and the registry is the value. */
  const OVER = "INQ-2026-3000-overclaimed";
  const V_OVER = {
    name: "the overclaimed reading", relationship: "and",
    description: "One record, written down as stronger than the record earns for it.",
    state: "accepted", state_by: "ruth", state_at: LATER,
    grounds: ["the record"],
    legs: [
      /* the row says A; the registry earns C for this document */
      { target: DOC_C1, ground: "the record", axis: "connection", source: "resolution", grade: "A" },
      /* the row says A on CAPTURE, above the ceiling the record can support */
      { target: DOC_A1, ground: "the record", axis: "capture", source: "capture", grade: "A" },
    ],
  };
  const wrote = await promote(OVER, inquiryMd(OVER,
    { subject: ORD, refs: [DOC_C1, DOC_A1], versions: [V_OVER] }), "inquiry");
  /* MEASURED RATHER THAN ASSUMED, and it is the finding this block exists for:
     the earned check runs over `basis[]` and NOT over a version's legs, so an
     overclaiming version row LANDS. That is precisely why "grades arrive from
     the registry" has to be enforced at the READ. */
  t("a version leg claiming more than the record earns LANDS at the write — the earned check "
    + "does not reach version legs (MEASURED, and the reason the read must enforce it)",
    wrote.ok, true);
  const r = await strength(`id=${OVER}&version=${encodeURIComponent(V_OVER.name)}`);
  t("and the READ reports what the record EARNS, not what the row claims: A on the row, C in the answer",
    [axis(r, "connection").grade, earnedConn(DOC_C1)], ["C", "C"]);
  t("the CAPTURE axis is CAPPED at the ceiling, never raised to it — a bound is not a measurement",
    [axis(r, "capture").grade, EARNED_CAPTURE_CEILING], [EARNED_CAPTURE_CEILING, EARNED_CAPTURE_CEILING]);
  t("and the answer SAYS the leg was authored higher than the record supports, beside both letters",
    (r.graded ?? []).filter((m) => m.grade_axis === "capture")
      .map((m) => [m.authored, m.grade, /cannot support the stronger claim/.test(m.why ?? "")]),
    [["A", EARNED_CAPTURE_CEILING, true]]);
  t("the connection leg says the same way: the row claimed A and the record earns C",
    (r.graded ?? []).filter((m) => m.grade_axis === "connection").map((m) => [m.authored, m.grade]),
    [["A", "C"]]);
}
{
  /* A MEMBER'S TESTIMONY IS NOT THE MACHINE MINTING A GRADE. The registry drops
     grade-D rows deliberately; a signed account carries its own author and date
     and survives, because erasing it would be this read overruling a member. */
  const TES = "INQ-2026-3000-testimony";
  const V_TES = {
    name: "the testimony reading", relationship: "and",
    description: "One document, connected to the subject by a member's own signed account.",
    state: "accepted", state_by: "ruth", state_at: LATER,
    grounds: ["the account"],
    legs: [{ target: DOC_BARE, ground: "the account", axis: "connection",
             source: "testimony", grade: "D" }],
  };
  await mustPromote(TES, inquiryMd(TES, { subject: ORD, refs: [DOC_BARE], versions: [V_TES] }), "inquiry");
  const r = await strength(`id=${TES}&version=${encodeURIComponent(V_TES.name)}`);
  t("a member's signed testimony stands at D — the machine never mints one and never erases one",
    [axis(r, "connection").state, axis(r, "connection").grade], ["graded", "D"]);
  t("and the registry earned nothing for that document, so the letter is the member's and says so",
    [earnedConn(DOC_BARE), (r.graded ?? []).map((m) => /signed account/.test(m.why ?? ""))],
    [null, [true]]);
}

/* ============ 6. THE STATE SET — DEFAULT, AND §6 RULE 6'S WHAT-IF ======= */
console.log("\n--- 6. the state-set argument defaults to accepted; exploring is calculating over ---");
const SUG = "INQ-2026-3000-unaccepted";
const V_SUG = {
  name: "nobody has adopted this", relationship: "and",
  description: "A reading a run proposed and no member has acted on.",
  state: "suggested",
  grounds: ["the record"],
  legs: [{ target: DOC_A1, ground: "the record", axis: "connection", source: "resolution", grade: "A" }],
};
await mustPromote(SUG, inquiryMd(SUG, { subject: ORD, refs: [DOC_A1], versions: [V_SUG] }), "inquiry");
{
  t("the DEFAULT state set is `accepted` alone, DERIVED from the machine's vocabulary",
    [VERSION_STRENGTH_DEFAULT_STATES, VERSION_STATES.includes("accepted")], [["accepted"], true]);
  const dflt = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`);
  t("an answer with no states named carries the default set on its face",
    [dflt.state_set, dflt.what_if], [["accepted"], false]);

  const refused = await strength(`id=${SUG}&version=${encodeURIComponent(V_SUG.name)}`);
  t("a reading nobody has adopted is NOT what the record answers with — refused by C-number",
    [refused.ok, refused.code, refused.check, refused.version_state],
    [false, "VERSION_STRENGTH_STATE_EXCLUDED", "C-30.6", "suggested"]);
  t("and the refusal NAMES THE WIDENING rather than being a dead end (§6 rule 6)",
    [/what-if|Ask again naming/i.test(refused.detail ?? ""),
     /suggested/.test(refused.detail ?? "")], [true, true]);

  const whatIf = await strength(`id=${SUG}&version=${encodeURIComponent(V_SUG.name)}&states=suggested,accepted`);
  t("WIDENING THE SET calculates over it — exploration without making anything current",
    [whatIf.ok, whatIf.what_if, whatIf.state_set, axis(whatIf, "connection").grade],
    [true, true, ["suggested", "accepted"], "A"]);
  t("nothing was adopted, hidden or made current by asking: the reading is still `suggested`",
    (await GET(`op=basisversions&token=${RUTH}&id=${SUG}`))?.versions?.[0]?.state, "suggested");
  t("the set comes back in the MACHINE's order, so two callers naming it differently compare",
    (await strength(`id=${SUG}&version=${encodeURIComponent(V_SUG.name)}&states=accepted,suggested`)).state_set,
    ["suggested", "accepted"]);
  const bad = await strength(`id=${SUG}&version=${encodeURIComponent(V_SUG.name)}&states=maybe`);
  t("a state outside the machine's closed vocabulary is refused, naming the vocabulary",
    [bad.code, bad.check, bad.legal], ["VERSION_STRENGTH_UNKNOWN_STATE", "C-30.5", VERSION_MACHINE.legal]);
  const many = await strength(
    `id=${SUG}&version=${encodeURIComponent(V_SUG.name)}&states=${VERSION_MACHINE.legal.join(",")},accepted`);
  t("more state words than the record has is refused with the bound PUBLISHED, not applied silently",
    [many.code, many.limit], ["VERSION_STRENGTH_TOO_MANY_STATES", VERSION_MACHINE.legal.length]);
}

/* ============ 7. DEC-40 — THE STATE SET TRAVELS, IN BAND ================ */
console.log("\n--- 7. DEC-40: the answer states which readings it counted, on its face, always ---");
{
  const dflt = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`);
  const whatIf = await strength(`id=${SUG}&version=${encodeURIComponent(V_SUG.name)}&states=suggested,accepted`);
  t("EVERY answer carries the line — the unfiltered one too, because its absence is the ambiguity",
    [typeof dflt.filter, typeof whatIf.filter], ["string", "string"]);
  t("the what-if line says on its face that it is a view the caller constructed",
    [/WHAT-IF/.test(line(whatIf)), /not what this record stands on/.test(line(whatIf))], [true, true]);
  t("and it NAMES the state set and the reading it was computed over, in the line itself",
    [line(whatIf).includes("suggested"), line(whatIf).includes(V_SUG.name)], [true, true]);
  t("the default line says it is the record's own answer and is NOT filtered",
    [/is not filtered/.test(line(dflt)), /WHAT-IF/.test(line(dflt))], [true, false]);
  t("the machine-readable set travels beside the sentence, so no consumer parses prose",
    [Array.isArray(dflt.state_set), Array.isArray(whatIf.state_set)], [true, true]);
  /* THE GUARD, not merely the convention: an answer with no line is REFUSED. */
  t("and a missing line is a REFUSAL with a canned translation, not a formatting lapse",
    [chk("VERSION_STRENGTH_UNFILTERED").check,
     /src\/store\.mjs #refusePairComposed/.test(chk("VERSION_STRENGTH_UNFILTERED").where ?? "")],
    ["C-30.8", true]);
}

/* ====== 8. M9'S SENTENCE — BOTH STATES, EACH OVER THE FACTS THAT MAKE IT = */
console.log("\n--- 8. M9's acceptance: an axis that cannot be graded says so AND names the leg ---");
/* M9's acceptance sentence reads: *"an ungraded leg SUSPENDS its axis, which
   then reads `undetermined` and names the leg that is why."* IT CARRIES RETIRED
   VOCABULARY IN BOTH HALVES and this block asserts the behaviour rather than the
   spelling, which is what "correct a superseded assertion, never exempt it"
   means when the superseded thing is a milestone sentence:
     - `SUSPEND` is D-160's retired word. Its dated amendment declares UNRATED
       canonical and rules that *"every SUSPEND below it is to be read as
       UNRATED"* — SUSPEND already meant the OPPOSITE thing in SB-OUTPUT §5.1,
       which D-160 calls *"the single most dangerous collision in the corpus"*.
     - DEC-18 then settled what an ungraded leg DOES, explicitly: *"if EVERY leg
       is ungraded there are no load-bearing legs, the conclusion rests on
       nothing established, and it is UNRATED naming all of them."* A
       single-ground reading whose only leg is ungraded is exactly that case.
   So the state word in M9's sentence is pre-DEC-18 and pre-D-160, and asserting
   the literal `undetermined` there would ship the state that means *we could not
   finish looking* for the fact *nothing here was established* — two different
   claims (D-129's own distinction), and the record saying the wrong one.
   BOTH STATES ARE THEREFORE ASSERTED, each over the facts that produce it, so
   the correction is demonstrated rather than asserted: the plane says UNRATED
   when nothing is established and `undetermined` when a necessary part could not
   be finished, and NAMES THE LEG in both. Raised for CONDUCT rather than acted
   on beyond this suite — MILESTONES.md is not this session's path. */
{
  const ONE = "INQ-2026-3000-single-ungraded";
  const V_ONE = {
    name: "the single account", relationship: "and",
    description: "One reading, resting on one document nothing has been established about.",
    state: "accepted", state_by: "ruth", state_at: LATER,
    grounds: ["the record"],
    legs: [{ target: DOC_BARE, ground: "the record", axis: "connection", source: "resolution" }],
  };
  await mustPromote(ONE, inquiryMd(ONE, { subject: ORD, refs: [DOC_BARE], versions: [V_ONE] }), "inquiry");
  const r = await strength(`id=${ONE}&version=${encodeURIComponent(V_ONE.name)}`);
  t("M9, HALF ONE — a single-ground reading whose one leg is ungraded has NO computed strength",
    [axis(r, "connection").state, axis(r, "connection").grade, axis(r, "connection").determined],
    ["unrated", null, false]);
  t("M9, HALF TWO — and it NAMES THE LEG THAT IS WHY, which is the half that never changed",
    [(axis(r, "connection").not_load_bearing ?? []).map((m) => m.target_id),
     (r.ungraded ?? []).map((m) => m.target_id)], [[DOC_BARE], [DOC_BARE]]);
  t("the sentence a reader gets names the leg too, and says this is not a low score",
    [(axis(r, "connection").detail ?? "").includes(DOC_BARE),
     /rests on nothing established/.test(axis(r, "connection").detail ?? "")], [true, true]);
  t("D-160's canonical word is what the plane says, and the retired spelling appears nowhere in the answer",
    [/\bsuspend/i.test(JSON.stringify(r)), axis(r, "connection").state], [false, "unrated"]);
}
{
  /* AND THE OTHER STATE, over the facts that actually produce it: a NECESSARY
     part the walk could not finish. Built by DRIVING a chain deeper than the
     bound rather than by typing a state name — the bound is the plane's own
     `QUEUE_ANCESTOR_DEPTH` and this fixture is sized from it. */
  const CHAIN = 9;
  const ids = Array.from({ length: CHAIN }, (_, i) => `INQ-2026-3000-chain-${i}`);
  for (let i = CHAIN - 1; i >= 0; i--)
    await mustPromote(ids[i], inquiryMd(ids[i], {
      refs: i + 1 < CHAIN ? [ids[i + 1]] : [],
      basis: i + 1 < CHAIN ? [{ target: ids[i + 1] }] : [] }), "inquiry");
  const DEEP = "INQ-2026-3000-deep";
  const V_DEEP = {
    name: "the deep account", relationship: "and",
    description: "One reading, resting on a question that rests on a chain longer than the walk.",
    state: "accepted", state_by: "ruth", state_at: LATER,
    grounds: ["the chain"],
    legs: [{ target: ids[0], ground: "the chain", axis: "connection", source: "inherited" }],
  };
  await mustPromote(DEEP, inquiryMd(DEEP, { subject: ORD, refs: [ids[0]], versions: [V_DEEP] }), "inquiry");
  const r = await strength(`id=${DEEP}&version=${encodeURIComponent(V_DEEP.name)}`);
  t("a NECESSARY part the walk could not finish reads `undetermined` — a different state, different facts",
    [axis(r, "connection").state, axis(r, "connection").grade], ["undetermined", null]);
  t("and it NAMES the leg it stopped at and the bound it stopped on — unknown, not absent",
    [(axis(r, "connection").undetermined_at ?? []).length > 0,
     axis(r, "connection").depth_bound > 0,
     /unknown rather than absent/.test(axis(r, "connection").detail ?? "")], [true, true, true]);
  t("THE TWO STATES ARE NOT THE SAME CLAIM, and the plane says both — which is the correction demonstrated",
    ["unrated", "undetermined"].includes(axis(r, "connection").state)
      && axis(r, "connection").state !== "unrated", true);
}

/* ================ 9. THE OP, THE GATE AND DEC-49 ======================== */
console.log("\n--- 9. the op through the control plane: refusals, the gate, and DEC-49 ---");
{
  t("no question named", (await strength("")).code, "VERSION_STRENGTH_NO_INQUIRY");
  t("a thing that is not a question", (await strength(`id=${PROJ}`)).code, "VERSION_STRENGTH_NOT_AN_INQUIRY");
  t("a question that does not exist answers exactly as one nobody may see",
    (await strength("id=INQ-2026-9999-nowhere")).code, "VERSION_STRENGTH_NOT_AN_INQUIRY");
  t("no reading named and no project asking — there is no default reading",
    [(await strength(`id=${INQ}`)).code, (await strength(`id=${INQ}`)).check],
    ["VERSION_STRENGTH_NO_VERSION", "C-30.3"]);
  t("a reading by that name does not belong to this question",
    (await strength(`id=${INQ}&version=nothing-by-that-name`)).code, "VERSION_STRENGTH_NO_SUCH_VERSION");
  t("a project that has named no reading is told so, rather than given a guess",
    (await strength(`id=${INQ}&project=${PROJ}`)).code, "VERSION_STRENGTH_NO_VERSION");
  /* THE PROJECT'S OWN POINTER, through the ONE reader the make-current act
     writes through — §7: current is the PROJECT's relationship to the inquiry. */
  const made = await POST(`op=versioncurrent&token=${RUTH}&target=${INQ}`
    + `&version=${encodeURIComponent(V_MIXED.name)}&project=${PROJ}`, {});
  t("once a project says what it stands on, the pair answers over THAT reading with no version named",
    [made.ok, (await strength(`id=${INQ}&project=${PROJ}`)).version], [true, V_MIXED.name]);
  t("and the answer says which project's stance it used, so one team's ground never reads as everybody's",
    (await strength(`id=${INQ}&project=${PROJ}`)).project, PROJ);
}
{
  /* FAIL-CLOSED. An unauthenticated caller never reaches the store at all, which
     is the arm that matters: the gate compiles to DENY on an absent stamp. */
  const bare = await GET(`op=versionstrength&id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`);
  t("an unauthenticated caller is refused and no reading, no pair and no letter reaches them",
    [bare.ok === true, "pair" in (bare ?? {}), "filter" in (bare ?? {})], [false, false, false]);
  t("the op is declared as a pure READ and the control plane stamps its viewer",
    [/versionstrength: \{ classes: \["admin", "member", "probe"\],\s+mutating: false \}/.test(INDEX_SRC),
     /\|\| op === "versionstrength"/.test(INDEX_SRC)], [true, true]);
}
{
  /* DEC-49, AS A FLOOR AND A CEILING. A ceiling passes trivially over nothing,
     so the set of codes this op can send is DRIVEN and required to be the
     family — not merely contained by it. */
  const driven = new Set();
  const drivenChecks = new Set();
  for (const q of ["", `id=${PROJ}`, `id=${INQ}`, `id=${INQ}&version=nope`,
                   `id=${SUG}&version=${encodeURIComponent(V_SUG.name)}`,
                   `id=${SUG}&version=${encodeURIComponent(V_SUG.name)}&states=maybe`,
                   `id=${SUG}&version=${encodeURIComponent(V_SUG.name)}&states=${VERSION_MACHINE.legal.join(",")},accepted`]) {
    const r = await strength(q);
    if (r && r.ok === false && r.code) driven.add(r.code);
    if (r && r.ok === false && r.check) drivenChecks.add(r.check);
  }
  /* THE C-NUMBERS PINNED AGAINST WHAT THE PLANE ACTUALLY SENT OVER THE WIRE,
     never against the registry they came from — PL-1's discipline, and the
     reason is that a suite reading the catalogue to check the catalogue agrees
     with itself at zero cost. The left side is DRIVEN out of the plane; the
     right side is the claim this item makes about which numbers it allocated. */
  t("C-30.1, C-30.2, C-30.3, C-30.4, C-30.5, C-30.6 and C-30.9 are the numbers the plane SENT, "
  + "measured off the wire rather than read out of the catalogue",
    [...drivenChecks].sort(),
    ["C-30.1", "C-30.2", "C-30.3", "C-30.4", "C-30.5", "C-30.6", "C-30.9"]);
  /* The two SELF-GUARD rows are not reachable from a well-formed call and are
     driven by `strengthpair.control.mjs` instead — declared here by name so the
     difference between "not driven" and "not drivable" is stated rather than
     inferred from a smaller set. */
  const selfGuards = ["VERSION_STRENGTH_COMPOSED", "VERSION_STRENGTH_UNFILTERED"];
  t("every argument-level code in the family is DRIVEN through the control plane — a floor, not a ceiling",
    [...driven].sort(),
    Object.keys(VERSION_STRENGTH_CHECKS).filter((k) => !selfGuards.includes(k)).sort());
  t("and every code the op sends carries a C-number, a canned translation and a REGION `where`",
    [...driven].every((c) => {
      const row = VERSION_STRENGTH_CHECKS[c];
      return row && /^C-30\.\d+$/.test(row.check) && row.translation.length > 40
             && / > is-version-strength$/.test(row.where);
    }), true);
  t("the two self-guards carry their OWN `where`, so neither site conscripts the other's refusals",
    selfGuards.map((k) => chk(k).where ?? null),
    ["src/store.mjs #refusePairComposed > is-pair-composed",
     "src/store.mjs #refusePairComposed > is-pair-composed"]);
  t("NO canned translation uses the analyst's vocabulary on a member's screen (DEC-32 cl. 1, D-226)",
    Object.entries(VERSION_STRENGTH_CHECKS)
      .filter(([, r]) => /\bground\b|\bpartition\b|\bAND\b|\bOR\b|disjunct/.test(r.translation))
      .map(([k]) => k), []);
  /* THE REGION MARKER IS REAL AND NON-TRIVIAL — REC-71's rule, and the span is
     asserted rather than assumed, because a `where` that stops resolving is an
     arm that stopped running while still reporting green. */
  const open = STORE_SRC.indexOf("DEC-49 REGION is-version-strength");
  const close = STORE_SRC.indexOf("END DEC-49 REGION is-version-strength");
  const span = open >= 0 && close > open
    ? STORE_SRC.slice(open, close).split("\n").length : 0;
  t("the region is DECLARED in the source, opened once, closed once, and is a real span",
    [count(STORE_SRC, "DEC-49 REGION is-version-strength"), span > 30], [2, true]);
  t("and the refusals inside it name their codes as STRING LITERALS, so the guard can compare them",
    count(STORE_SRC.slice(open, close), 'refusal("VERSION_STRENGTH_') >= 6, true);
}

/* ================ 10. ONE ARITHMETIC, REACHED THROUGH ONE SEAM ========== */
console.log("\n--- 10. the arithmetic is reached, never restated ---");
{
  const s = strip(STORE_SRC);
  /* IS-6's C-22.4 control passed vacuously at 98/98 because a rule had TWO
     implementations and removing either left the other absorbing the control.
     A count pin is what a behavioural arm cannot do. */
  /* COUNTED WITHOUT THE OPENING PAREN DELIBERATELY, and the reason is the pin's
     own control: a second implementation arrives under a DIFFERENT NAME (that is
     what a second implementation is), so a pin anchored on the exact signature
     would count one and report a single implementation triumphantly. Measured —
     the control's first run armed `#axisResultAgain` and this pin, written with
     the paren, stayed GREEN at 88/88. */
  t("DEC-32's composition is implemented ONCE — one `#axisResult`, one `#groundResult`, one `#weakestOf`",
    [count(s, "static #axisResult"), count(s, "static #groundResult"), count(s, "static #weakestOf")],
    [1, 1, 1]);
  const body = (() => {
    const at = s.indexOf("versionStrength(a = {})");
    const end = s.indexOf("\n  #versionLegsAsMembers", at);
    return at < 0 ? "" : s.slice(at, end > at ? end : at + 20000);
  })();
  t("and `versionStrength` composes nothing itself — it hands legs to the ONE walk and reports",
    [body.length > 500, /#strengthWalk\(inq, 0, bound, resolved\.legs\)/.test(body),
     /Math\.(min|max)/.test(body), /GRADE_RANK/.test(body)], [true, true, false, false]);
  t("the seam it uses is PL-3's `legsOverride` parameter and not a second walk",
    [count(s, "#strengthWalk(bundleId, depth, bound, legsOverride = null)"),
     count(s, "legsOverride ?? (this.basisFor(bundleId).legs ?? [])")], [1, 1]);
  /* AND THE READER RE-RUN OVER A SOURCE THAT DOES RESTATE IT, required to find
     it — a walk over a corpus it cannot see reports one implementation
     triumphantly. */
  const doubled = s.replace("static #axisResult(", "static #axisResultTwo(x){return x;}\n  static #axisResult(");
  t("the same reader over a source carrying a SECOND composition finds two — the pin is not blind",
    [count(s, "static #axisResult"), count(doubled, "static #axisResult")], [1, 2]);
  t("no schema change rode this item: the version tables are PL-1's, unaltered",
    [/versionStrength/.test(readFileSync(SRC("schema.mjs"), "utf8")),
     count(s, "CREATE TABLE IF NOT EXISTS inquiry_basis_versions")], [false, 0]);
}

/* ================ 11. OVER-STRICTNESS — THESE MUST PASS ================= */
console.log("\n--- 11. over-strictness: correct work must not be refused ---");
{
  const ok1 = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}&states=accepted`);
  t("naming the default set EXPLICITLY is not a what-if — the same set is the same answer",
    [ok1.ok, ok1.what_if, ok1.state_set], [true, false, ["accepted"]]);
  const ok2 = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}&states=%20accepted%20`);
  t("padding round a state word is trimmed rather than refused",
    [ok2.ok, ok2.state_set], [true, ["accepted"]]);
  const ok3 = await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}&states=`);
  t("an EMPTY states parameter is the absent one, not an empty set",
    [ok3.ok, ok3.state_set], [true, ["accepted"]]);
  t("a version name with spaces and mixed case round-trips through the op",
    (await strength(`id=${INQ}&version=${encodeURIComponent(V_MIXED.name)}`)).version, V_MIXED.name);
  t("the answer says whether it read the whole reading, rather than leaving a consumer to compare counts",
    [ok1.legs_read, ok1.legs_complete], [7, true]);
  t("and the grade vocabulary is the catalog's, so a letter this file never typed is still checkable",
    BASIS_GRADES.includes(axis(ok1, "connection").grade), true);
}

} catch (e) {
  console.log(`  FAIL  suite threw: ${e && e.stack ? e.stack : e}`);
  fail++;
} finally {
  await mf.dispose();
  console.log(`\nstrengthpair: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
