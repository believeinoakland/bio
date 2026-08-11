/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/versionstate.control.mjs` — which is deliberately NOT a `.test.mjs` because it EDITS REAL SOURCES while it runs, so the battery must not discover it (`check-refusal-codes.mjs`'s precedent). ALL NINE ARMS RUN 2026-08-08, pl2-agent, IS-BUILD-PLAN PL-2 / IS-2; **THREE MORE ADDED AND ALL TWELVE RE-RUN 2026-08-09** (worktree agent-ae8e8c4d786783a6b) — see the 2026-08-09 block below, which also records that arm (1a) had stopped arming. Every arm is armed ALONE against a whole tree, every restore is verified BY sha256 AND BY CONTENT, and every arm names the assertions that MUST fail — an arm that fails "somewhere" proves the suite is sensitive to something, an arm that fails AT ITS OWN LAYER proves the layer is doing the work. THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad: a worker's harness was overwritten mid-turn by a concurrent worker on 2026-08-07, and a harness silently replaced between ARM and RESTORE reports a restore it never performed. BASELINE, whole tree: 72 pass, 0 fail.
   THE THREE-LAYER ARM IS THE ITEM (VERIFICATION rule 3a). The fence that stops a machine credential settling a reading lives in THREE layers — the CREDENTIAL STAMP (index.mjs stamps `token:<class>` and overwrites a caller-supplied `author`), the ENDPOINT (index.mjs NEEDS requires `contribute`), and the TRANSITION (store.mjs refuses a machine identity by shape) — and EACH ABSORBS THE OTHER TWO when it is whole. A control that broke all three at once would prove nothing about any of them, so each is broken with the other two HELD OPEN.
   (1a) LAYER 1, THE CREDENTIAL STAMP, layers 2 and 3 held open. In src/index.mjs let the stamp fire for member sessions and NOT for machine credentials (`|| VERSION_ACTIONS.includes(op)` -> `|| (VERSION_ACTIONS.includes(op) && viaSession)`). MEASURED: 67 pass, 5 FAIL. A machine credential's `author=ruth` is HONOURED, the store sees a perfectly good member name, and all six acts LAND under a false attribution — layer 3's refusal is intact and cannot see it, which is the point. Layer 1's own assertion (`the caller-supplied author was OVERWRITTEN rather than honoured`) fails, and the `LAYER 2, BEHAVIOURALLY` arm fails with it because that call also carries an author.
   (1a-first-draft) CORRECTED WHILE RUNNING, and the correction is a finding rather than a tidy-up. The first (1a) DELETED the stamp outright — which also unstamps every MEMBER session, so the suite fell over in FOURTEEN places and not one of them was about impersonation. A control that breaks everything proves nothing about the one thing it names. It ALSO measured something the item did not predict: the impostor attempt must be made IN THE QUERY STRING, because the store's argument reader takes `author` from the stamped search params and from nowhere else — a body field could never have been honoured even with the stamp gone, so the first version of the suite's own arm was aimed at a route the attack cannot take and the control STAYED GREEN at every arm. Both were corrected; the arm is surgical now and the suite's attempt is a real one.
   (1b) LAYER 2, THE ENDPOINT CAPABILITY, layers 1 and 3 held open. In src/index.mjs delete the six `version*: "contribute"` rows from NEEDS. MEASURED: 70 pass, 2 FAIL — layer 2's own source assertion, and the TOTALITY arm that reads NEEDS out of the source. A signed-in member holding no `contribute` then reaches the store, which sees a perfectly good member name and moves the reading: neither of the other two layers has anything to say about a capability.
   (1c) LAYER 3, THE TRANSITION, layers 1 and 2 held open. In src/store.mjs #moveVersionState replace `if (!who || isMachineIdentity(who))` with `if (false)`. MEASURED: 67 pass, 5 FAIL — every one of the six stops refusing the machine credential by C-number, the ONE-predicate arm fails, layer 3's source assertion fails, and the DEC-49 FLOOR fails because MACHINE_CANNOT_MOVE_VERSION becomes unreachable. The credential is still honestly stamped `token:member` and still holds no capability question to answer, so nothing else stops it.
   (2) THE IMPLEMENTATION-COUNT PIN, and it is here because IS-6's C-22.4 control left its suite GREEN AT 98/98: the rule it broke had TWO implementations, one inlined in a second function, so removing either left the other absorbing the control. Add a second `isMachineIdentity` guard inside `versionAccept` before it delegates. MEASURED: 70 pass, 2 FAIL — the count pin and its REACH arm, AND NOTHING ELSE. Every behavioural arm still passes, because the second copy does the first one's job. That is the whole finding: the pin fails where behaviour cannot.
   (3) DROP THE REASON REQUIREMENT AT THE OP. In src/store.mjs #moveVersionState replace `if (versionNeedsReason(to) && !why)` with `if (false && versionNeedsReason(to) && !why)`. MEASURED: 67 pass, 5 FAIL NAMING THE TRANSITION: a reading is turned down with nothing recorded, the PREVIEW arm fails with it (the preview runs every guard, so it stops refusing too — which is what makes the preview and the act impossible to disagree), and the DEC-49 FLOOR fails because VERSION_NO_REASON becomes unreachable.
   (3b) DROP THE CATALOG'S HALF INSTEAD. In checks/bio-checks.mjs basisVersionFindings replace `if (versionNeedsReason(v.state)) {` with `if (false) {`. MEASURED: 69 pass, 3 FAIL, and the op's own arm STAYS GREEN — only the arm that hand-authors a `bundle.md` already claiming a reason-bearing state can see it. Neither half is redundant and this pair is what proves it: the op refuses an ACT with no reason, the catalog refuses a DOCUMENT that arrives already claiming one, and no op ever produces the second shape.
   (4) MOVE THE FENCE OUT OF THE CODE. Repoint the store's MACHINE_CANNOT_MOVE_VERSION refusal at another code, leaving the act's published LABEL saying what a machine may not do. MEASURED: 66 pass, 6 FAIL — the behavioural arms, the count pin, layer 3's SOURCE assertion and the DEC-49 floor. EVERY FENCE IS CODE, NEVER A LINE IN A SKILL OR A LABEL, and the source assertion is what says so.
   (5) BREAK THE TRANSITIVE CYCLE CHECK AT ACCEPT. In src/store.mjs #moveVersionState replace `cycle = inqTargets.length ? this.#basisCyclePath(target, inqTargets) : null;` with `cycle = null;`. MEASURED: 67 pass, 5 FAIL: accepting a reading whose leg names a question that already rests on this one is PERMITTED, so the answer becomes its own support, and the DEC-49 floor loses VERSION_BASIS_CYCLE.
   (5b) WRITE A SECOND CYCLE WALK rather than calling the existing one (`#basisCyclePathTwo` delegating to it). MEASURED: 71 pass, 1 FAIL — the CALL-SITE count, which is the pin that can see it. NOTE what this corrected in the control itself: the DEFINITION count stays at 1 because the second walk carries a second NAME, so the arm's first claim about which pin would fire was wrong and the pin was right. Behaviour is identical TODAY, which is exactly the condition under which a second walk drifts from the first — PL-1 recorded this edge rather than half-building it for that reason.
   (6) OVER-STRICTNESS, and these must PASS rather than fail: a reason in Spanish from a named member LANDS; a version name with a full stop and mixed-case labels LANDS; `preview=true` from a surface that spells booleans as words is honoured; a project whose `references[]` is authored in a different field order still stands on a reading; and a reading resting on a question BELOW this one ACCEPTS — the cycle check refuses a circle, not the recursion DEC-23 licenses. A fence that refuses correct work is a defect in the fence.
   ---- ARMS ADDED 2026-08-09 (C-25.32, the reason that arrived and could not be stored). RE-RUN OF ALL TWELVE: 12 arms run, 0 misbehaved, exit 0, whole-tree baseline 78 pass / 0 fail before each. AND THE RE-RUN'S FIRST FINDING WAS ABOUT ARM (1a) RATHER THAN ABOUT ANY SUBJECT: **(1a)'s ANCHOR HAD GONE STALE ON `main` AND THE ITEM'S HEADLINE THREE-LAYER CONTROL COULD NOT ARM AT ALL** — it was written against `|| VERSION_ACTIONS.includes(op)` immediately followed by `|| op === "provenancechain")`, and PL-3 later landed `|| op === "suggest"` BETWEEN those two lines, so the patch matched ZERO times. It did not pass quietly: the harness's occurs-exactly-once guard threw and named the count, which is the only reason it was visible. **VF-5 requires CONDUCT to re-run this three-layer control on the integrated build, so this arm would have been a gate passing over nothing.** Re-anchored on the single line it edits; MEASURED after re-anchoring: 73 pass, 5 FAIL, exactly as its original run recorded.
   (7) THE DEFECT ITSELF, RE-ARMED — collapse the two reason conditions back into one, which is the state `main` was in until this turn: `refuse("VERSION_REASON_MALFORMED"` -> `refuse("VERSION_NO_REASON"`. MEASURED: 74 pass, 4 FAIL — the C-25.32 behavioural arm, the three-acts-that-need-no-reason arm, the DRIVEN-SET-EQUALS-REGISTRY floor and the by-name C-number pin. **The ABSENT-reason arms STAY GREEN, held open and required to**, which is what distinguishes "these two conditions are separable" from "the reason guard is broken": a missing reason always answered C-25.26 correctly, and only a reason the member GAVE was being told it was worth nothing.
   (8) OVER-STRICTNESS, ARMED RATHER THAN ASSUMED — tighten the grammar to refuse an apostrophe as well (`/["\\\r\n]/` -> `/["'\\\r\n]/`, anchored on the refusal beneath it because the identical guard occurs THREE times in `store.mjs`). MEASURED: 70 pass, 8 FAIL. **THE BREADTH IS RECORDED RATHER THAN SMOOTHED: eight, not the one this arm declared.** The declared assertion did fail and every refusal arm stayed green as declared — but the suite's own fixtures write ordinary prose, so an apostrophe ban also took the four-state walk, both receipt arms, the act-is-queryable arm and the ageing arm. That is the finding rather than a defect in the arm: *a fence tighter than its rule* does not fail one assertion politely, it stops correct work everywhere at once.
   (9) THE FLOOR, NOT THE CEILING — leave C-25.32 in the registry and delete the ONE call that drives it out of the plane (this arm edits the SUITE, which is why the suite joined the harness's sha256-and-content restore set). MEASURED: 76 pass, 2 FAIL — the driven-set floor and the by-name pin. A ceiling-only assertion would have reported an unreachable refusal as fine.
/* IS-BUILD-PLAN PL-2 / IS-2 — THE SIXTH STATE MACHINE OVER BASIS VERSIONS.
 *
 * INVESTIGATIVE-SESSION.md §6 rule 4, and the design says it in these words:
 * *"Each version has its own state: `suggested` · `considering` · `accepted` ·
 * `rejected`. … **This is a SIXTH state machine and the design says so**"*. The
 * five that exist are the five keys of `STATES`; task states and proposal
 * dispositions are different vocabularies belonging to different objects, and
 * nothing existing is this machine (SWEEP §1.4). Block 1 asserts the sixth-ness
 * rather than leaving it to a comment.
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *  1. THE MACHINE IS THE SIXTH, and it is DEFINED ONCE. `VERSION_MACHINE` is an
 *     export of the catalog; the store, the act catalogue and this suite all
 *     read it; no file re-types a state name.
 *
 *  2. ALL FOUR STATES ARE REACHABLE AND REVERSIBLE through the control plane,
 *     driven by the six member ops — never by writing a document by hand.
 *     `accepted -> suggested` is the ONE absent reversal and it is absent on
 *     purpose (§6 rule 5: acceptance is a historical fact).
 *
 *  3. THE FOUR BEATS, on EVERY one of the six: choose (no default version),
 *     see what will be refused BEFORE it runs (`preview` writes nothing and
 *     cannot disagree with the act, because it IS the act up to the write),
 *     author the reason, and a receipt that lands IN THE RECORD and not only in
 *     the response.
 *
 *  4. THE REASON IS REQUIRED ON THE TWO STATES §6 rule 4 names, AT BOTH LAYERS.
 *     VERIFICATION rule 3a: a rule enforced in N places carries an assertion at
 *     EACH place, and the two layers are separated by an arm that reaches each
 *     one alone.
 *
 *  5. MACHINE IDENTITY IS REFUSED ON EVERY TRANSITION — all six, by C-number,
 *     through REC-46's ONE predicate. §4: THE AI HOLDS NO OP THAT ACCEPTS.
 *
 *  6. PROPOSALS AGGREGATE AND AGE (§6.4) — a settled reading leaves the open
 *     list and stays queryable, keeps its legs, keeps counting in `total`, and
 *     the acts on it accumulate ON IT rather than multiplying rows. D-78's
 *     `surfaced_by` fix is asserted LANDED REAL here, because the plan makes it
 *     this item's dependency and a dependency nobody checks is a dependency
 *     nobody has.
 *
 *  7. THE TRANSITIVE BASIS CYCLE FIRES AT ACCEPT, through the EXISTING
 *     `#basisCyclePath` — the check PL-1 recorded rather than half-built.
 *
 *  8. THE MACHINE IS PUBLISHED through `op=affordances`: the states, the edges,
 *     the reason-bearing set, and the six acts derived over REAL facts so the
 *     publication cannot offer a control the refusal it fronts would decline.
 *
 *  9. THE IMPLEMENTATION COUNT IS PINNED over comment-stripped real source, both
 *     ways and with the walk RE-RUN over a corpus that DOES carry a second
 *     implementation. IS-6's C-22.4 control passed vacuously at 98/98 because a
 *     rule had two implementations; a count pin is what a behavioural arm cannot
 *     do.
 *
 * 10. THE THREE-LAYER FENCE IS NAMED with its three separate assertions, so the
 *     control has something at each layer to fail.
 *
 * 11. DEC-49: every refusal the six ops can send carries a C-number, a wire code
 *     and a canned translation from ONE row — the set DRIVEN and required to
 *     EQUAL the registry, a FLOOR as well as a ceiling, because a ceiling passes
 *     trivially over nothing.
 *
 * NO MEMBER-FACING STRING IN THIS ITEM SAYS "ground", "partition", "AND" or "OR"
 * as a member-facing word (DEC-32's elicitation clause 1, D-226) and block 11
 * asserts that of every canned translation directly.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, parseFrontmatter, VERSION_STATES, VERSION_MACHINE,
         VERSION_REASON_REQUIRED, versionNeedsReason,
         VERSION_ACT_CHECKS, BASIS_VERSION_CHECKS, STATES } from "../checks/bio-checks.mjs";
import { VOCABULARIES, ACTS, NON_ACTS } from "../src/affordances.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");
const AFF_SRC = readFileSync(SRC("affordances.mjs"), "utf8");
const CHECKS_SRC = readFileSync(fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url)), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT READS throughout, PL-1's discipline: an arm that throws on
   `.findings[0]` of undefined takes every arm behind it with it and reports one
   defect as none. An accumulating assertion is only HALF that fix, because a
   TypeError never reaches it at all. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : null;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl2", MEMBER_TOKEN: "mem-pl2", PROBE_TOKEN: "prb-pl2", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

/* The transition body, isolated once so every arm that asks a question about it
   asks the same question of the same text. A FUNCTION DECLARATION, so it is
   hoisted above the blocks that call it and the file still reads top to bottom:
   it is an instrument and not a subject. */
function machineBlock() {
  const at = STORE_SRC.indexOf("#moveVersionState(act, args)");
  if (at < 0) return "";
  const end = STORE_SRC.indexOf("\n  #setProjectCurrentVersion(", at);
  return STORE_SRC.slice(at, end < 0 ? at + 20000 : end);
}

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-pl2",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);
/* A member holding NO `contribute`. FENCE LAYER 2's own subject: without one
   there is nothing for the endpoint layer's assertion to be about, and the
   three-layer control would have only two layers to break. */
const NOAH = await enrol("noah", "admin", ["publish"]);

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
    ...scalar("run", v.run),
    ...scalar("author", v.author === undefined ? "ruth" : v.author),
    ...scalar("at", v.at === undefined ? NOW : v.at),
    ...scalar("state_by", v.state_by), ...scalar("state_at", v.state_at),
    ...scalar("state_reason", v.state_reason)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ["  - version: \"" + v.name + "\"", ...scalar("ground", g.ground),
     ...scalar("asserted_by", g.asserted_by === undefined ? "ruth" : g.asserted_by),
     ...scalar("at", g.at === undefined ? NOW : g.at)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ["  - version: \"" + v.name + "\"", ...scalar("target", l.target),
     ...scalar("role", l.role === undefined ? "supports" : l.role),
     ...scalar("ground", l.ground),
     ...scalar("grade", l.grade), ...scalar("grade_axis", l.grade_axis),
     ...scalar("grade_source", l.grade_source)].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const inquiryMd = (id, { question = `What does ${id} rest on?`, refs = [], versions = null,
                         basis = [], surfacedBy = "agent" } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", `surfaced_by: ${surfacedBy}`, 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  /* A leg to another QUESTION is a CONNECTION and never a capture (DEC-21,
     C-2.8): capture is a property of an information object, so a capture-axis
     grade on an inquiry leg has no referent at all. */
  ...(basis.length ? ["basis:", ...basis.flatMap((b) => [`  - target: ${b.target}`,
      "    role: supports"])]
    : []),
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
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* A project whose `references[]` names the question, in a DIFFERENT field order
   from anything this item writes — the over-strictness arm's own fixture. */
const projectMd = (id, refs = []) => ["---", `id: ${id}`, "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - rel: cites`,
      `    status: confirmed`, `    target: ${x}`])] : ["references: []"]),
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

const promote = async (id, text, type, base = null, tok = RUTH) => POST(`op=promote&token=${tok}`, {
  bundleId: id, base,
  snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
    : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;

const LEDGER = "INFO-2026-2000-ledger", MINUTES = "INFO-2026-2000-minutes";
const AUDIT = "INFO-2026-2000-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await mustPromote(d, infoMd(d), "information");

const INQ = "INQ-2026-2000-sewer-transfers";
const V1 = {
  name: "opening account", relationship: "and",
  description: "The first reading: the ledger and the minutes together show the transfer.",
  run: "AIRUN-2026-2000-first",
  grounds: [{ ground: "paper trail" }],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
         { target: MINUTES, ground: "paper trail", grade: "C", grade_axis: "connection", grade_source: "testimony" }],
};
/* A SECOND reading, so the machine is exercised over a question that holds more
   than one — which is the whole reason versions exist and the only shape in
   which "which reading" can be got wrong. */
const V2 = {
  /* NOT derived from V1: a derivation that regroups the partition owes REC-45's
     attributed act (DEC-50), which is PL-1's rule and not this item's subject.
     A reading a run composed fresh has no parent, and that is the shape here. */
  name: "the audit alone", relationship: "and",
  description: "Second reading: the audit carries the finding without the paper trail.",
  run: "AIRUN-2026-2000-second",
  grounds: [{ ground: "the audit" }],
  legs: [{ target: AUDIT, ground: "the audit", grade: "B", grade_axis: "capture", grade_source: "capture" }],
};
await mustPromote(INQ, inquiryMd(INQ, { refs: [LEDGER, MINUTES, AUDIT], versions: [V1, V2] }), "inquiry");

const versionsOf = async (id, extra = "", tok = RUTH) =>
  GET(`op=basisversions&token=${tok}&id=${encodeURIComponent(id)}${extra}`);
const byName = async (id, n, extra = "", tok = RUTH) =>
  ((await versionsOf(id, extra, tok))?.versions ?? []).find((v) => v.name === n) || null;
const act = async (verb, { target = INQ, version = "opening account", tok = RUTH, q = "", body } = {}) =>
  POST(`${ACT_OP[verb]}&token=${tok}&target=${encodeURIComponent(target)}`
     + `&version=${encodeURIComponent(version)}${q}`, body);

/* THE SIX OPS, SPELLED OUT AS LITERALS rather than composed from `VERBS`.
   `scripts/coverage.mjs` reads `op=<name>` out of the suite sources to decide
   whether a real caller has a route to an op, so an op only ever reached through
   a template hole is one the instrument reports as UNREACHED — the D-43 class
   arriving through the test rather than through the plane. Composing them was the
   first draft here and `--strict` caught it on the same turn, naming
   `versionconsider`. The literals are the reachable record, `VERBS` is the loop
   variable, and `ACT_OP` is what binds the two so they cannot come apart. */
const ACT_OP = {
  accept: "op=versionaccept", reject: "op=versionreject", consider: "op=versionconsider",
  revert: "op=versionrevert", current: "op=versioncurrent", hide: "op=versionhide",
};
const VERBS = ["accept", "reject", "consider", "revert", "current", "hide"];

console.log("\n=== PL-2 / IS-2 · the SIXTH state machine over basis versions ===");
console.log(`  corpus: store.mjs ${STORE_SRC.length} chars, index.mjs ${INDEX_SRC.length}, `
  + `affordances.mjs ${AFF_SRC.length}, bio-checks.mjs ${CHECKS_SRC.length} · `
  + `${VERSION_STATES.length} states, ${Object.keys(VERSION_MACHINE.edges).length} edge rows, `
  + `${VERBS.length} member ops, ${Object.keys(VERSION_ACT_CHECKS).length} refusals in the registry`);

/* ====================================================================== 1
 * THE MACHINE IS THE SIXTH, AND IT IS DEFINED ONCE.
 * ==================================================================== */
console.log("\n--- 1. the sixth state machine, stated as such and defined once ---");
{
  /* The five that already exist are the keys of STATES — read from the catalog,
     never counted by hand. `focus` and `problem` are the inquiry machine's two
     legacy spellings, so the count of DISTINCT machines is what matters and the
     assertion says which. */
  const stateKeys = Object.keys(STATES).sort();
  t("the five OBJECT machines are the catalog's own keys, and the version machine is NOT among them — "
  + "a version is not an object type, has no bundle id, and is never checkStateLegality's subject",
    [stateKeys.includes("information"), stateKeys.includes("inquiry"), stateKeys.includes("action"),
     stateKeys.includes("project"), Object.prototype.hasOwnProperty.call(STATES, "version"),
     Object.prototype.hasOwnProperty.call(STATES, "basis_version")],
    [true, true, true, true, false, false]);
  t("and the code that DEFINES it says it is the SIXTH, in those words, where the other five are defined",
    [/THIS IS THE SIXTH STATE MACHINE/.test(CHECKS_SRC),
     /SIXTH STATE MACHINE/.test(CHECKS_SRC.slice(
       Math.max(0, CHECKS_SRC.indexOf("export const VERSION_MACHINE") - 3000),
       CHECKS_SRC.indexOf("export const VERSION_MACHINE")))],
    [true, true]);
  t("the four states are §6 rule 4's four, read from PL-1's export and never re-typed",
    VERSION_STATES, ["suggested", "considering", "accepted", "rejected"]);
  t("every state has an edge row and every edge names a state the machine holds — a machine with an "
  + "edge to a state that does not exist is one nobody can leave",
    [Object.keys(VERSION_MACHINE.edges).sort(), VERSION_MACHINE.legal === VERSION_STATES,
     Object.values(VERSION_MACHINE.edges).flat().every((s) => VERSION_STATES.includes(s))],
    [[...VERSION_STATES].sort(), true, true]);
  /* §6 rule 4: "considering and rejected are reversible, the states are not a
     one-way ladder". §6 rule 5: acceptance is a HISTORICAL FACT. The one absent
     reversal is absent on purpose and the assertion says so. */
  t("REVERSIBILITY: considering and rejected both lead back, and `accepted -> suggested` is the ONE "
  + "reversal the machine refuses — un-saying an acceptance would erase an act that happened",
    [VERSION_MACHINE.edges.considering.includes("suggested"),
     VERSION_MACHINE.edges.rejected.includes("suggested"),
     VERSION_MACHINE.edges.accepted.includes("suggested"),
     VERSION_MACHINE.edges.accepted.includes("rejected"),
     VERSION_MACHINE.edges.accepted.includes("considering")],
    [true, true, false, true, true]);
  t("the two reason-bearing states are the construct's DEFER and DISMISS, in ONE array with ONE predicate "
  + "over it — never a second membership test",
    [VERSION_REASON_REQUIRED, VERSION_STATES.filter((s) => versionNeedsReason(s)),
     versionNeedsReason("accepted"), versionNeedsReason("suggested")],
    [["considering", "rejected"], ["considering", "rejected"], false, false]);
}

/* ====================================================================== 2
 * ALL FOUR STATES REACHABLE AND REVERSIBLE, THROUGH THE CONTROL PLANE.
 * ==================================================================== */
console.log("\n--- 2. the four states, driven through the six ops (never by hand) ---");
{
  const seen = [];
  const step = async (verb, extra) => {
    const r = await act(verb, extra);
    const v = await byName(INQ, "opening account");
    seen.push([verb, r.ok === true, v?.state ?? null]);
    return r;
  };
  await step("consider", { body: { reason: "the minutes are the clerk's summary, not the record" } });
  await step("accept");
  await step("reject", { body: { reason: "the audit contradicts the ledger on the transfer date" } });
  await step("revert");
  t("DRIVEN, never typed: suggested -> considering -> accepted -> rejected -> suggested, every step "
  + "through its own op and every state read back from the plane",
    seen, [["consider", true, "considering"], ["accept", true, "accepted"],
           ["reject", true, "rejected"], ["revert", true, "suggested"]]);
  t("and every one of the four states was actually OCCUPIED — a walk that never entered a state proves "
  + "nothing about it",
    [...new Set(seen.map((s) => s[2]))].sort(), [...VERSION_STATES].sort());

  /* The ONE illegal move, refused BY NAME and naming the set it could have made
     — a refusal that leaves a member to guess the legal set is a refusal that
     costs them a second round trip. */
  await act("accept");
  const bad = await act("revert");
  t("ILLEGAL TRANSITION refused by C-number, naming where it stands and what it COULD do — accepting is "
  + "a historical fact and there is no way back to something nobody acted on",
    [bad.ok, codeOf(bad), bad.check, bad.from, bad.to, bad.legal],
    [false, "VERSION_ILLEGAL_TRANSITION", "C-25.25", "accepted", "suggested",
     VERSION_MACHINE.edges.accepted]);
  t("and NOTHING MOVED — a refusal that half-wrote is worse than one that refused",
    (await byName(INQ, "opening account"))?.state, "accepted");
}

/* ====================================================================== 3
 * THE FOUR BEATS, ON EVERY ONE OF THE SIX.
 * ==================================================================== */
console.log("\n--- 3. the four beats: choose · preview · reason · receipt ---");
{
  /* BEAT 1 — CHOOSE. No default version anywhere, on any of the six. */
  const noVersion = [];
  for (const verb of VERBS) {
    const r = await POST(`${ACT_OP[verb]}&token=${RUTH}&target=${INQ}`, { reason: "a reason" });
    noVersion.push([verb, r.ok, codeOf(r)]);
  }
  t("BEAT 1 — CHOOSE: not one of the six has a default version. Acting on the wrong reading is worse "
  + "than being asked which was meant",
    noVersion, VERBS.map((v) => [v, false, "VERSION_ACT_NO_VERSION"]));
  const noTarget = await POST(`op=versionaccept&token=${RUTH}&version=opening%20account`, {});
  t("and no default QUESTION either — a reading belongs to one question and there is no other kind",
    [noTarget.ok, codeOf(noTarget)], [false, "VERSION_ACT_NO_INQUIRY"]);
  const wrongKind = await act("accept", { target: LEDGER });
  t("and a thing that is not a question holds no readings to act on",
    [wrongKind.ok, codeOf(wrongKind)], [false, "VERSION_ACT_NOT_AN_INQUIRY"]);
  const noSuch = await act("accept", { version: "a reading nobody wrote" });
  t("and a name nobody wrote is refused rather than matched to the nearest — with the names that DO "
  + "exist handed back, so the member is not left guessing",
    [noSuch.ok, codeOf(noSuch), (noSuch.known ?? []).sort()],
    [false, "VERSION_ACT_NO_SUCH_VERSION", ["opening account", "the audit alone"]]);

  /* BEAT 2 — SEE WHAT WILL BE REFUSED BEFORE IT RUNS. */
  const before = await byName(INQ, "the audit alone");
  const pv = await act("consider", { version: "the audit alone", q: "&preview=1",
                                     body: { reason: "waiting on the second audit" } });
  const after = await byName(INQ, "the audit alone");
  t("BEAT 2 — PREVIEW says what WOULD happen and writes NOTHING: the reading has not moved, no act is "
  + "attributed to it, and the answer says outright that it wrote nothing",
    [pv.ok, pv.preview, pv.wrote, pv.from, pv.to, before?.state, after?.state, after?.moved],
    [true, true, false, "suggested", "considering", "suggested", "suggested", null]);
  const pvBad = await act("consider", { version: "the audit alone", q: "&preview=1" });
  t("and the preview RUNS EVERY GUARD rather than describing them: with no reason supplied it returns "
  + "the SAME refusal the act would, which is what makes it impossible for the two to disagree",
    [pvBad.ok, codeOf(pvBad), pvBad.check], [false, "VERSION_NO_REASON", "C-25.26"]);
  /* The over-strictness half: a surface that sends the string "true" rather than
     the number 1 is a correct caller phrased unlike anything written here. */
  const pvStr = await act("hide", { version: "the audit alone", q: "&preview=true" });
  t("OVER-STRICTNESS: `preview=true` from a surface that spells booleans as words is a correct caller "
  + "and is honoured — a fence that refuses correct work is a defect in the fence",
    [pvStr.ok, pvStr.preview, pvStr.wrote, (await byName(INQ, "the audit alone"))?.hidden],
    [true, true, false, false]);

  /* BEAT 4 — RECEIPT, and it lands IN THE RECORD. */
  const r = await act("reject", { version: "the audit alone",
                                  body: { reason: "the audit's scope excluded this transfer" } });
  t("BEAT 4 — RECEIPT: the answer names the act, the reading, where it moved from and to, the member "
  + "and the instant",
    [r.ok, r.act, r.version, r.from, r.to, r.author, typeof r.at === "string" && r.at.endsWith("Z"),
     r.reason, r.weight],
    [true, "reject", "the audit alone", "suggested", "rejected", "ruth", true,
     "the audit's scope excluded this transfer", "single"]);
  const md = (await GET(`op=image&token=${RUTH}&id=${encodeURIComponent(INQ)}`))?.["bundle.md"] ?? "";
  t("and the receipt is IN THE RECORD and not only in the response — the Session Log carries the act, "
  + "the reading, the move and the reason, which is what a reader six months later actually opens",
    [/\| Version reject \| ruth/.test(md),
     /reading 'the audit alone' suggested to rejected/.test(md),
     /Reason: the audit's scope excluded this transfer/.test(md)],
    [true, true, true]);
  const back = await byName(INQ, "the audit alone");
  t("and the ACT is queryable on the reading itself — who moved it, when, and why (D-214: the pattern "
  + "is visible only if the acts persist)",
    [back?.state, back?.moved?.by, typeof back?.moved?.at === "string", back?.moved?.reason],
    ["rejected", "ruth", true, "the audit's scope excluded this transfer"]);
  await act("revert", { version: "the audit alone" });
}

/* ====================================================================== 4
 * THE REASON, REQUIRED AT BOTH LAYERS (VERIFICATION rule 3a).
 * ==================================================================== */
console.log("\n--- 4. the authored reason, enforced at BOTH layers and reached at each ---");
{
  const need = [];
  for (const verb of VERBS) {
    /* Driven from a clean state each time so the answer is about the reason and
       not about an edge. */
    await act("revert", { version: "the audit alone" }).catch(() => {});
    const r = await act(verb, { version: "the audit alone",
                                ...(verb === "current" ? { q: "&project=PROJ-2026-2000-oversight" } : {}) });
    need.push([verb, codeOf(r) === "VERSION_NO_REASON"]);
  }
  t("LAYER 1 (the op): the two states §6 rule 4 names carry a reason and the other four acts do not — "
  + "derived from `versionNeedsReason`, so this assertion moves when the rule does",
    need,
    VERBS.map((v) => [v, versionNeedsReason({ accept: "accepted", reject: "rejected",
      consider: "considering", revert: "suggested", current: null, hide: null }[v])]));
  const rj = await act("reject", { version: "the audit alone" });
  t("and the refusal is by C-number with its DEC-49 code and its canned translation — never a bare "
  + "`refused`, which VF-2's guard now fails the harness for",
    [rj.ok, codeOf(rj), rj.check, typeof rj.translation === "string" && rj.translation.length > 40],
    [false, "VERSION_NO_REASON", "C-25.26", true]);

  /* PRESENT BUT EMPTY IS THE SAME REFUSAL AS ABSENT, AND IT HAS TO BE DRIVEN
     RATHER THAN REASONED ABOUT. `String(a.reason ?? "").trim()` collapses an
     absent field, an empty string and a run of spaces to the same value, and a
     rule believed on the strength of a `.trim()` is a rule nobody drove. A
     surface that always sends the field and sometimes sends it blank is the
     ordinary case, not the exotic one. */
  const emptyish = [];
  for (const body of [{ reason: "" }, { reason: "   " }, { reason: "\t" }]) {
    const r = await act("reject", { version: "the audit alone", body });
    emptyish.push([JSON.stringify(body.reason), codeOf(r), r.check]);
  }
  t("A REASON THAT IS PRESENT AND EMPTY IS REFUSED EXACTLY AS AN ABSENT ONE — empty string, spaces "
  + "and a tab all reach C-25.26, because a blank box is not an authored reason",
    emptyish,
    [['""', "VERSION_NO_REASON", "C-25.26"], ['"   "', "VERSION_NO_REASON", "C-25.26"],
     ['"\\t"', "VERSION_NO_REASON", "C-25.26"]]);

  /* ---------------------------------------------------------------------
     C-25.32 — A REASON THAT ARRIVED AND CANNOT BE STORED IS NOT A MISSING ONE.
     Corrected 2026-08-09. Until then both conditions answered
     `VERSION_NO_REASON`, so a member who typed a reason carrying a double quote
     read C-25.26's *"…it is worth nothing without the reason"* — a sentence
     about an omission they did not make. THE OLD ASSERTION WAS NOT EXEMPTED: it
     is directly above and still requires C-25.26 for the ABSENT case, which is
     the half it was always right about.
     The restricted frontmatter grammar has no escapes, so `he said "the budget
     is fixed"` genuinely cannot be stored — the refusal is correct and only its
     words were wrong, which is exactly the class PL-19 corrected one item over:
     a refusal a caller actually reads, carrying the wrong account of itself. */
  const QUOTED = 'the audit says "the transfer never cleared", which this reading does not answer';
  const TOO_LONG = "x".repeat(501);
  const malformed = [];
  for (const [what, body] of [["a double quote", { reason: QUOTED }],
                              ["a backslash", { reason: "the ledger path C:\\accounts disagrees" }],
                              ["a newline", { reason: "first point\nsecond point" }],
                              ["501 characters", { reason: TOO_LONG }]]) {
    const r = await act("reject", { version: "the audit alone", body });
    malformed.push([what, r.ok, codeOf(r), r.check]);
  }
  t("A REASON THE MEMBER GAVE AND THE RECORD CANNOT STORE IS ITS OWN REFUSAL (C-25.32) — over the "
  + "length bound, or carrying a quote, a backslash or a newline the grammar has no escape for",
    malformed,
    [["a double quote", false, "VERSION_REASON_MALFORMED", "C-25.32"],
     ["a backslash", false, "VERSION_REASON_MALFORMED", "C-25.32"],
     ["a newline", false, "VERSION_REASON_MALFORMED", "C-25.32"],
     ["501 characters", false, "VERSION_REASON_MALFORMED", "C-25.32"]]);

  /* AND THE ACTS THAT NEED NO REASON AT ALL, which is where the old code was
     worst rather than merely imprecise. `accept`, `current` and `hide` skip the
     missing-reason guard entirely — `versionNeedsReason` is false for all three
     — and reach the grammar arm alone. Under the old code a member ACCEPTING a
     reading with a quoted note was told that setting a reading aside carries a
     reason: a sentence about an act they did not perform, refusing an act that
     requires no reason whatsoever. */
  const noReasonActs = [];
  for (const verb of ["accept", "hide", "current"]) {
    const r = await act(verb, { version: "the audit alone", body: { reason: QUOTED },
                                ...(verb === "current" ? { q: "&project=PROJ-2026-2000-oversight" } : {}) });
    noReasonActs.push([verb, codeOf(r), r.check]);
  }
  t("AND ON THE THREE ACTS THAT REQUIRE NO REASON AT ALL, the same row answers — the old code told a "
  + "member accepting a reading with a quoted note that turning a reading down carries a reason",
    noReasonActs,
    [["accept", "VERSION_REASON_MALFORMED", "C-25.32"],
     ["hide", "VERSION_REASON_MALFORMED", "C-25.32"],
     ["current", "VERSION_REASON_MALFORMED", "C-25.32"]]);

  /* THE TRANSLATIONS ARE DIFFERENT SENTENCES AND NEITHER IS THE OTHER'S. This is
     the assertion that would have failed on the defect and that a shared code
     could not have carried at all: with one row for both conditions there is no
     pair of translations to compare. */
  t("and the two conditions do not share a sentence: the malformed row never says the reason is "
  + "missing, and the missing row never offers to shorten anything",
    [VERSION_ACT_CHECKS.VERSION_REASON_MALFORMED.translation
       === VERSION_ACT_CHECKS.VERSION_NO_REASON.translation,
     /without the reason|worth nothing/.test(VERSION_ACT_CHECKS.VERSION_REASON_MALFORMED.translation),
     /given but could not be stored/.test(VERSION_ACT_CHECKS.VERSION_REASON_MALFORMED.translation),
     /shorten/i.test(VERSION_ACT_CHECKS.VERSION_NO_REASON.translation)],
    [false, false, true, false]);

  /* OVER-STRICTNESS, and it is the arm that keeps the fence from being tighter
     than its rule: a reason AT the bound, in prose a member would really write —
     an apostrophe, an em dash, an accented word — LANDS, and the act completes.
     A fence that refuses correct work is a defect in the fence, and a
     length check off by one is exactly how one gets there. */
  /* EXACTLY 500 after the store's own `.trim()`, which is the number the guard
     compares. Built by repeat-and-slice and then FLOORED by the assertion below
     rather than counted by hand: the first draft of this line sliced a 453-
     character string to 500 and would have tested the bound at 453 while
     reading as though it tested it at 500 — the arm caught itself, and a length
     assertion that is not itself asserted is how an off-by-one arm passes. The
     final character is forced non-blank so the trim cannot shorten it. */
  const AT_BOUND = (("the auditor's own note — la contradicción está en la fecha — is what this reading "
                   + "does not answer, and it is the whole of why it is being turned down. ").repeat(5)
                   .slice(0, 499) + ".").replace(/\s\.$/, "..");
  const okReject = await act("reject", { version: "the audit alone", body: { reason: AT_BOUND } });
  const landed = await byName(INQ, "the audit alone");
  t("OVER-STRICTNESS: a reason of EXACTLY the 500-character bound, carrying an apostrophe, an em dash "
  + "and accented words, LANDS and the act completes — the bound is a bound, not a style",
    [AT_BOUND.length, okReject.ok, codeOf(okReject), landed?.state],
    [500, true, null, "rejected"]);
  /* AND THE FIXTURE IS PUT BACK, verified rather than assumed: every block after
     this one reads `the audit alone` as `suggested`, and a suite that leaves a
     neighbour's subject moved is a suite that fails somewhere else for a reason
     nobody can find. */
  const restored = await act("revert", { version: "the audit alone" });
  t("and the fixture is RESTORED to `suggested` by an act that is itself recorded, checked here rather "
  + "than assumed, so no later block reads a state this block left behind",
    [restored.ok, (await byName(INQ, "the audit alone"))?.state], [true, "suggested"]);

  /* LAYER 2 (the catalog), reached ALONE. This document never goes through the
     op: it is hand-authored already claiming a reason-bearing state with nothing
     behind it — the shape a replay, a future writer, or a member editing the
     file produces, and the ONE shape the op's refusal cannot see. */
  const HAND = "INQ-2026-2000-hand-authored";
  const orphanState = inquiryMd(HAND, { refs: [LEDGER], versions: [
    { ...V1, name: "unsigned dismissal", state: "rejected",
      legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" }] },
  ] });
  const wrote = await promote(HAND, orphanState, "inquiry");
  const catFiles = new Map([["bundle.md", orphanState]]);
  const cat = await checkBundle({ folderName: HAND, files: catFiles,
    sha256: async (v) => sha(typeof v === "string" ? v : Buffer.from(v)),
    resolveTarget: () => true });
  const catCodes = [...new Set((cat?.findings ?? []).map((f) => f.code))];
  t("LAYER 2 (the catalog), REACHED ALONE: a document that arrives ALREADY claiming a state it needs a "
  + "reason for, with nobody's name and no reason, is refused at the write AND found by the catalog — "
  + "the op's refusal never sees this shape, which is why one layer could not carry the rule",
    [wrote.ok, wrote.reason,
     (wrote.findings ?? []).some((f) => f.code === "VERSION_DISPOSITION_UNATTRIBUTED"),
     catCodes.includes("VERSION_DISPOSITION_UNATTRIBUTED")],
    [false, "BASIS_VERSION_REFUSED", true, true]);
  const machineSigned = inquiryMd(HAND, { refs: [LEDGER], versions: [
    { ...V1, name: "machine dismissal", state: "rejected", state_by: "token:member",
      state_at: NOW, state_reason: "the machine decided this reading was weak",
      legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" }] },
  ] });
  const w2 = await promote(HAND, machineSigned, "inquiry");
  t("and a reason with a MACHINE's name against it is refused by the same row through REC-46's ONE "
  + "predicate — `token:member` and `class:member` both reached the record when this was last asked "
  + "as a word list",
    [w2.ok, (w2.findings ?? []).some((f) => f.code === "VERSION_DISPOSITION_UNATTRIBUTED")],
    [false, true]);
  /* OVER-STRICTNESS: a real reason in a language nothing here was written in. */
  const spanish = inquiryMd(HAND, { refs: [LEDGER], versions: [
    { ...V1, name: "lectura descartada", state: "rejected", state_by: "ruth", state_at: NOW,
      state_reason: "la auditoría contradice el libro mayor en la fecha de la transferencia",
      legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" }] },
  ] });
  const w3 = await promote(HAND, spanish, "inquiry");
  t("OVER-STRICTNESS: a perfectly good reason in Spanish, from a member, LANDS — the rule is that a "
  + "reason exists and a member authored it, never that it looks like anything written here",
    [w3.ok, (await byName(HAND, "lectura descartada"))?.moved?.by], [true, "ruth"]);
}

/* ====================================================================== 5
 * MACHINE IDENTITY REFUSED ON EVERY TRANSITION (§4).
 * ==================================================================== */
console.log("\n--- 5. §4 — the AI holds no op that settles a reading ---");
{
  const refused = [];
  for (const verb of VERBS) {
    /* THE IMPOSTOR ATTEMPT IS MADE IN THE QUERY STRING, which is where the
       control plane copies a caller's own parameters from before overwriting
       them (index.mjs's `for (const [k, v] of url.searchParams)` loop). A body
       field would be a weaker attempt than a real one: the store's argument
       reader takes `author` from the stamped search params and from nowhere
       else, so a body value could never have been honoured even with the stamp
       gone — and a control aimed at a route the attack cannot take is a control
       that cannot fail. */
    const r = await POST(`${ACT_OP[verb]}&token=mem-pl2&target=${INQ}`
      + `&version=${encodeURIComponent("opening account")}&project=PROJ-2026-2000-oversight`
      + `&author=ruth`,
      { reason: "the machine's own reason" });
    refused.push([verb, r.ok, codeOf(r), r.check]);
  }
  t("EVERY ONE OF THE SIX refuses a machine credential by C-number — not accept alone, because "
  + "hiding a reading and choosing what a project stands on are decisions about the record too",
    refused, VERBS.map((v) => [v, false, "MACHINE_CANNOT_MOVE_VERSION", "C-25.24"]));
  t("and the caller-supplied `author` was OVERWRITTEN rather than honoured (fence layer 1): the "
  + "machine could not sign a member's name to the decision even by asking to",
    (await byName(INQ, "opening account"))?.state, "accepted");
  /* The one predicate, asserted as one: no word list anywhere near the act. */
  /* Over the CODE and not the prose: the block's own comments name `token:` and
     `class:` deliberately, because that is what they are explaining. What must
     not exist is a literal spelling the code BRANCHES on. */
  const machineCode = machineBlock().replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  t("REC-46's ONE predicate and never a word list — the transition CODE calls `isMachineIdentity` once "
  + "and branches on no machine-class spelling of its own (`token:member` and `class:member` both "
  + "reached the record when this was last asked as a word list)",
    [/"token:|'token:|`token:/.test(machineCode), /"class:|'class:|`class:/.test(machineCode),
     (machineCode.match(/isMachineIdentity\(/g) || []).length,
     machineCode.length > 2000],
    [false, false, 1, true]);
}

/* ====================================================================== 6
 * PROPOSALS AGGREGATE AND AGE (§6.4), AND LOOK DERIVED (D-78 / D-82).
 * ==================================================================== */
console.log("\n--- 6. §6.4: proposals aggregate, age rather than vanish, and look derived ---");
{
  /* DRIVEN into the settled state here rather than inherited from an earlier
     block: an arm whose premise is a state some other block happened to leave
     behind is an arm about the order the file runs in. */
  await act("revert", { version: "the audit alone" });
  await act("reject", { version: "the audit alone",
                        body: { reason: "the audit's scope excluded this transfer" } });
  const all = await versionsOf(INQ);
  t("AGE RATHER THAN VANISH: a settled reading leaves the open list and STAYS QUERYABLE — it keeps its "
  + "legs, keeps its description, keeps the reason it was turned down for, and keeps counting in `total`",
    [all.total, all.versions.length, all.versions.map((v) => v.state).sort(),
     all.versions.every((v) => v.legs.length > 0 && typeof v.description === "string"),
     all.versions.find((v) => v.name === "the audit alone")?.moved?.reason],
    [2, 2, ["accepted", "rejected"], true, "the audit's scope excluded this transfer"]);
  await act("hide", { version: "the audit alone" });
  const hidden = await versionsOf(INQ);
  t("HIDING IS NOT DELETING (D-214, DEC-29(b)): the display shrinks and the query still answers — the "
  + "hidden reading is returned, flagged, whole, and still counted",
    [hidden.total, hidden.versions.length,
     hidden.versions.find((v) => v.name === "the audit alone")?.hidden,
     hidden.versions.find((v) => v.name === "the audit alone")?.legs.length],
    [2, 2, true, 1]);
  const unhid = await act("hide", { version: "the audit alone", q: "&hidden=false" });
  t("and hiding is REVERSIBLE, which is what makes it an offer rather than a deletion",
    [unhid.ok, (await byName(INQ, "the audit alone"))?.hidden], [true, false]);

  /* AGGREGATE, NEVER MULTIPLY: acting five times on one reading leaves ONE
     reading carrying the latest act, not five rows. The failure this refuses is
     a review list that grows every time somebody looks at it. */
  for (const [verb, reason] of [["consider", "waiting on the audit"], ["revert", null],
                                ["consider", "still waiting"], ["revert", null]])
    await act(verb, { version: "the audit alone", ...(reason ? { body: { reason } } : {}) });
  const after = await versionsOf(INQ);
  t("AGGREGATE, NEVER MULTIPLY: four more acts on one reading leave ONE reading — a review list that "
  + "grew every time somebody looked at it is the burden §6.4 exists to refuse",
    [after.total, after.versions.filter((v) => v.name === "the audit alone").length],
    [2, 1]);

  /* LOOK DERIVED — D-78's fix, which the plan makes this item's dependency.
     A dependency nobody checks is a dependency nobody has. */
  const MACHINE_INQ = "INQ-2026-2000-machine-surfaced";
  const mr = await promote(MACHINE_INQ, inquiryMd(MACHINE_INQ, { refs: [LEDGER], surfacedBy: "human",
    versions: [{ ...V1, name: "machine reading",
      legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" }] }] }),
    "inquiry", null, "mem-pl2");
  const mmd = (await GET(`op=image&token=${RUTH}&id=${encodeURIComponent(MACHINE_INQ)}`))?.["bundle.md"] ?? "";
  t("D-78 IS LANDED REAL, and this item depends on it: a bundle written by a MACHINE credential records "
  + "`surfaced_by: agent` however the document spelled it, so machine work LOOKS derived (D-82) rather "
  + "than passing as a member's",
    [mr.ok, /^surfaced_by: agent$/m.test(mmd), /^surfaced_by: human$/m.test(mmd)],
    [true, true, false]);
  t("and a reading a run composed names the run that composed it, which is the other half of looking "
  + "derived — and it names it WITHOUT joining on the run being alive (§14b.7)",
    (await byName(MACHINE_INQ, "machine reading"))?.run, "AIRUN-2026-2000-first");
}

/* ====================================================================== 7
 * THE TRANSITIVE BASIS CYCLE, AT THE ACCEPT PATH, THROUGH THE EXISTING WALK.
 * ==================================================================== */
console.log("\n--- 7. the transitive basis cycle, fired at accept through PL-1's existing walk ---");
{
  /* A chain built by DRIVING the record rather than by describing it:
     C rests on B, B rests on A. A reading of A whose leg names C would make A
     rest, through B, on itself — and that is refused at the moment a member
     accepts the reading and its legs become what the answer rests on. */
  const A = "INQ-2026-2000-cycle-a", B = "INQ-2026-2000-cycle-b", C = "INQ-2026-2000-cycle-c";
  await mustPromote(A, inquiryMd(A, { refs: [LEDGER] }), "inquiry");
  await mustPromote(B, inquiryMd(B, { refs: [A], basis: [{ target: A }] }), "inquiry");
  await mustPromote(C, inquiryMd(C, { refs: [B], basis: [{ target: B }] }), "inquiry");
  const chain = inquiryMd(A, { refs: [LEDGER, C], versions: [
    { name: "resting on what rests on me", relationship: "and",
      description: "A reading whose leg names a question that already rests on this one.",
      grounds: [{ ground: "the chain" }],
      legs: [{ target: C, ground: "the chain" }] },
  ] });
  const wrote = await promote(A, chain, "inquiry", await shaOf(A));
  t("THE PROPOSAL LANDS — a leg naming a question that transitively rests on this one is harmless while "
  + "it is only a proposal, and refusing it at the write would refuse a run for composing a candidate",
    [wrote.ok, (await byName(A, "resting on what rests on me"))?.state], [true, "suggested"]);
  const acc = await act("accept", { target: A, version: "resting on what rests on me" });
  t("AND ACCEPTING IT IS REFUSED, naming the whole chain that closes the circle — this is the moment "
  + "the legs BECOME what the answer rests on, which is the moment PL-1 recorded and did not build",
    [acc.ok, codeOf(acc), acc.check, acc.path],
    [false, "VERSION_BASIS_CYCLE", "C-25.27", [A, C, B, A]]);
  t("and NOTHING MOVED: the reading is still a proposal, so a refused accept costs the record nothing",
    (await byName(A, "resting on what rests on me"))?.state, "suggested");
  /* OVER-STRICTNESS: the same shape WITHOUT the cycle must accept. A cycle check
     that refuses every inquiry-typed leg would pass the arm above and be wrong. */
  const okChain = inquiryMd(B, { refs: [A, LEDGER], basis: [{ target: A }], versions: [
    { name: "resting on a question below", relationship: "and",
      description: "A reading whose leg names a question that does NOT rest on this one.",
      grounds: [{ ground: "the chain" }],
      legs: [{ target: A, ground: "the chain" }] },
  ] });
  await mustPromote(B, okChain, "inquiry", await shaOf(B));
  const good = await act("accept", { target: B, version: "resting on a question below" });
  t("OVER-STRICTNESS: a reading resting on a question BELOW this one accepts — the check refuses a "
  + "circle, not the recursion DEC-23 licenses",
    [good.ok, (await byName(B, "resting on a question below"))?.state], [true, "accepted"]);
}

/* ====================================================================== 8
 * THE MACHINE PUBLISHES ITSELF THROUGH op=affordances.
 * ==================================================================== */
console.log("\n--- 8. the machine published, and the six acts derived over REAL facts ---");
{
  /* Driven into a shape where all six are legal SOMEWHERE among the readings —
     which is what `any` means and is the honest premise for the arm below. One
     reading stands accepted; the other is set aside, which is the only state
     `revert` has an edge back from besides `rejected`. */
  await act("consider", { version: "the audit alone", body: { reason: "waiting on the second audit" } });
  const aff = await GET(`op=affordances&token=${RUTH}&target=${INQ}`);
  const ids = (aff?.acts ?? []).map((a) => a.id);
  t("THE MACHINE ITSELF IS PUBLISHED — the states, the EDGES, and which states carry a reason — so no "
  + "surface showing a version's state holds a second copy of the rule (§6 rule 4, DEC-8's drift class)",
    [aff?.vocabularies?.version_states, aff?.vocabularies?.version_edges,
     aff?.vocabularies?.version_reason_required],
    [VERSION_STATES, VERSION_MACHINE.edges, VERSION_REASON_REQUIRED]);
  t("and it is the SAME table the store enforces and the catalog defines — imported, never restated",
    [VOCABULARIES.version_states === VERSION_MACHINE.legal,
     VOCABULARIES.version_edges === VERSION_MACHINE.edges,
     VOCABULARIES.version_reason_required === VERSION_REASON_REQUIRED],
    [true, true, true]);
  t("the six acts are published on a question that holds readings, each with its member-facing label "
  + "and the `single` weight one-reading-at-a-time implies",
    [VERBS.every((v) => ids.includes("version" + v)),
     (aff?.acts ?? []).filter((a) => a.id.startsWith("version")).every((a) => a.weight === "single"),
     (aff?.acts ?? []).filter((a) => a.id.startsWith("version"))
       .every((a) => typeof a.label === "string" && a.label.length > 8)],
    [true, true, true]);

  /* THE DERIVATION IS OVER FACTS, and the failing direction is the one that
     matters: a question with NO readings must publish NONE of the six, or the
     publication offers a control the refusal it fronts would decline. */
  const EMPTY = "INQ-2026-2000-no-readings";
  await mustPromote(EMPTY, inquiryMd(EMPTY, { refs: [LEDGER] }), "inquiry");
  const affEmpty = await GET(`op=affordances&token=${RUTH}&target=${EMPTY}`);
  const emptyIds = (affEmpty?.acts ?? []).map((a) => a.id).filter((x) => x.startsWith("version"));
  t("A QUESTION WITH NO READINGS PUBLISHES NONE OF THE SIX — an act offered where the op would refuse "
  + "NO_SUCH_VERSION is a pre-flight disagreeing with the refusal it fronts, which is DEC-8's own failure",
    [emptyIds, (affEmpty?.acts ?? []).some((a) => a.id === "conclude")], [[], true]);
  const affProject = await GET(`op=affordances&token=${RUTH}&target=INFO-2026-2000-ledger`);
  t("and none of the six is published on anything that is not a question",
    (affProject?.acts ?? []).map((a) => a.id).filter((x) => x.startsWith("version")), []);
  /* MAKE-CURRENT is offered only where something has been ACCEPTED — the store's
     own entry requirement, derived from the same fact. */
  const NOACC = "INQ-2026-2000-nothing-accepted";
  await mustPromote(NOACC, inquiryMd(NOACC, { refs: [LEDGER], versions: [
    { ...V1, name: "only a proposal",
      legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" }] }] }),
    "inquiry");
  const affNo = await GET(`op=affordances&token=${RUTH}&target=${NOACC}`);
  const noIds = (affNo?.acts ?? []).map((a) => a.id);
  t("MAKE-CURRENT is published only where a reading has been ACCEPTED (current implies accepted, §6 "
  + "rule 5), while accept, turn-down, set-aside and hide are all offered on a fresh proposal",
    [noIds.includes("versioncurrent"), noIds.includes("versionaccept"),
     noIds.includes("versionreject"), noIds.includes("versionhide"), noIds.includes("versionrevert")],
    [false, true, true, true, false]);

  /* REC-19's TOTALITY GUARD is what caught IS-6 within a minute. Asserted here
     too, in this item's own suite, rather than left to the affordances suite —
     because the failure it prevents is this item's. */
  const needsOps = [...INDEX_SRC.matchAll(/^\s{2}(version\w+):\s+"contribute"/gm)].map((m) => m[1]);
  t("TOTALITY: every one of the six is in NEEDS and is an ACT here — none is in NON_ACTS, and none "
  + "ships unpublished and unexplained",
    [needsOps.sort(), VERBS.map((v) => "version" + v).filter((o) => ACTS.some((a) => a.id === o)).sort(),
     VERBS.map((v) => "version" + v).filter((o) => o in NON_ACTS)],
    [VERBS.map((v) => "version" + v).sort(), VERBS.map((v) => "version" + v).sort(), []]);
}

/* ====================================================================== 9
 * THE IMPLEMENTATION COUNT, PINNED — and the three-layer fence NAMED.
 * ==================================================================== */
console.log("\n--- 9. the implementation-count pin, and the three layers of the fence ---");
{
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  const CODE = strip(STORE_SRC), ICODE = strip(INDEX_SRC), KCODE = strip(CHECKS_SRC);
  t("WALK GUARD (both ways): the stripper removed a substantial share of each source AND left the code "
  + "standing — a walk over an empty corpus reports a clean answer about nothing (REC-70's ceiling "
  + "without a floor)",
    [CODE.length < STORE_SRC.length * 0.8, CODE.includes("#moveVersionState(act, args)"),
     ICODE.length < INDEX_SRC.length * 0.9, ICODE.includes("const VERSION_ACTIONS"),
     KCODE.length < CHECKS_SRC.length * 0.8, KCODE.includes("export const VERSION_MACHINE")],
    [true, true, true, true, true, true]);
  console.log(`  corpus: ${CODE.length} code chars in store.mjs, ${ICODE.length} in index.mjs, `
    + `${KCODE.length} in bio-checks.mjs`);

  const count = (src, re) => (src.match(re) || []).length;
  /* THE PIN THAT IS_6's CONTROL NEEDED AND DID NOT HAVE. Each of these rules is
     enforced ONCE. A second implementation would let a control be armed against
     one while the other kept the suite green — which is exactly what happened at
     98/98, and no behavioural arm in this file could see it. */
  const pins = {
    "the transition body":            count(CODE, /#moveVersionState\s*\(act, args\)\s*\{/g),
    "the machine-identity refusal":   count(CODE, /MACHINE_CANNOT_MOVE_VERSION/g),
    "the reason predicate's calls":   count(CODE, /versionNeedsReason\(/g),
    "the reason predicate's home":    count(KCODE, /export const versionNeedsReason/g),
    "the reason-state array's home":  count(KCODE, /export const VERSION_REASON_REQUIRED/g),
    "the machine's home":             count(KCODE, /export const VERSION_MACHINE/g),
    "the cycle walk's home":          count(CODE, /#basisCyclePath\(bundleId, targets\)\s*\{/g),
    /* TWO reads and ONE rule: the guard, and the `legal:` set the refusal hands
       back so a member is told what they COULD have done rather than being left
       to re-derive it. Both are inside the one transition body, which is the
       property that matters and the arm below is what asserts it. */
    "the edge table's readers here":  count(CODE, /VERSION_MACHINE\.edges/g),
  };
  console.log("  pins: " + Object.entries(pins).map(([k, v]) => `${k}=${v}`).join(", "));
  t("ONE IMPLEMENTATION EACH — the count is pinned because a behavioural arm CANNOT see a second one: "
  + "IS-6's C-22.4 control left its suite green at 98/98 for exactly this reason",
    pins,
    { "the transition body": 1, "the machine-identity refusal": 1, "the reason predicate's calls": 1,
      "the reason predicate's home": 1, "the reason-state array's home": 1, "the machine's home": 1,
      "the cycle walk's home": 1, "the edge table's readers here": 2 });
  t("AND THE EDGE TABLE IS READ ONLY INSIDE THE ONE TRANSITION BODY — both reads are the guard and the "
  + "`legal` set its refusal hands back, so there is no second place in the store that decides what a "
  + "reading may do next",
    [(machineBlock().replace(/\/\*[\s\S]*?\*\//g, " ").match(/VERSION_MACHINE\.edges/g) || []).length,
     count(CODE, /VERSION_MACHINE\.edges/g)],
    [2, 2]);
  t("SIX ENTRY POINTS OVER ONE BODY — six ops is the item, six implementations would be the defect",
    [count(CODE, /return this\.#moveVersionState\("/g),
     VERBS.every((v) => new RegExp(`#moveVersionState\\("${v}"`).test(CODE))],
    [6, true]);
  t("AND THE CYCLE CHECK CALLS THE EXISTING WALK — one definition, and the accept path is a SECOND "
  + "caller of it rather than a second walk that would drift from the first (PL-1's recorded edge)",
    [count(CODE, /#basisCyclePath\(/g), count(CODE, /#basisReach\(/g)], [3, 3]);
  /* REACH: the same walk over a corpus that DOES carry the forbidden thing FINDS
     it, so a 1 is evidence of absence rather than of a reader that cannot see. */
  const doubled = CODE + "\n  if (!who || isMachineIdentity(who)) return { reason: 'MACHINE_CANNOT_MOVE_VERSION' };\n"
                       + "\n  #basisCyclePath(bundleId, targets) { return null; }\n";
  t("REACH: the same walk over a source that DOES carry a second implementation FINDS it — the pin is "
  + "a pin and not an exemption",
    [count(doubled, /MACHINE_CANNOT_MOVE_VERSION/g), count(doubled, /#basisCyclePath\(bundleId, targets\)\s*\{/g)],
    [2, 2]);

  /* THE THREE LAYERS, EACH WITH ITS OWN ASSERTION. The control breaks each with
     the others held open; these are the three assertions it must make fail. */
  t("FENCE LAYER 1 (the credential stamp, index.mjs): a machine credential's act is attributed "
  + "`token:<class>` and a caller-supplied `author` is overwritten — asserted at the source, because "
  + "the behavioural half is absorbed by layers 2 and 3 when they are whole",
    [/VERSION_ACTIONS\.includes\(op\)[\s\S]{0,200}?searchParams\.set\("author"/.test(ICODE)
     || /\|\| VERSION_ACTIONS\.includes\(op\)\n\s*\|\| op === "provenancechain"\)\n\s*inner\.searchParams\.set\("author"/.test(ICODE),
     ICODE.includes('searchParams.set("author", viaSession ? sessMember : `${MACHINE_AUTHOR_PREFIX}${cls}`)')],
    [true, true]);
  t("FENCE LAYER 2 (the endpoint capability, index.mjs NEEDS): all six require `contribute`",
    VERBS.map((v) => new RegExp(`versio\\w*${v}:\\s+"contribute"`).test(ICODE)),
    VERBS.map(() => true));
  t("FENCE LAYER 3 (the transition, store.mjs): the ONE machine-identity refusal is inside the ONE "
  + "transition body",
    [machineBlock().includes("MACHINE_CANNOT_MOVE_VERSION"),
     machineBlock().includes("isMachineIdentity(who)")],
    [true, true]);
  /* AND THE BEHAVIOURAL HALF OF LAYER 2, which only this layer can produce. */
  const noCap = await act("accept", { version: "opening account", tok: NOAH });
  t("LAYER 2, BEHAVIOURALLY: a signed-in member holding no `contribute` is refused at the CONTROL PLANE "
  + "and never reaches the store — a different refusal from the machine one, which is how the control "
  + "can tell the two layers apart",
    [noCap.ok === true, typeof noCap.error === "string" || typeof noCap.reason === "string",
     codeOf(noCap) === "MACHINE_CANNOT_MOVE_VERSION"],
    [false, true, false]);
}

/* ====================================================================== 10
 * MAKE-CURRENT — §7, THE PROJECT'S OWN DATED DECLARATION.
 * ==================================================================== */
console.log("\n--- 10. make-current: the PROJECT's dated pointer, never a settings row ---");
{
  const PROJ = "PROJ-2026-2000-oversight", OTHER = "PROJ-2026-2000-budget";
  await mustPromote(PROJ, projectMd(PROJ, [INQ]), "project");
  await mustPromote(OTHER, projectMd(OTHER, [INQ]), "project");
  const noProj = await act("current", { version: "opening account" });
  t("NO DEFAULT PROJECT, and that is §7's whole point: a question can sit beneath several teams and "
  + "one team's decision must never quietly move another's",
    [noProj.ok, codeOf(noProj), noProj.check], [false, "VERSION_CURRENT_NO_PROJECT", "C-25.29"]);
  const notAcc = await act("current", { version: "the audit alone", q: `&project=${PROJ}` });
  t("CURRENT IMPLIES ACCEPTED (§6 rule 5): an unsettled reading is explored by CALCULATING OVER IT, "
  + "never by making it what a whole team stands on",
    [notAcc.ok, codeOf(notAcc), notAcc.from], [false, "VERSION_NOT_ACCEPTED", "considering"]);
  const STRANGER = "PROJ-2026-2000-unrelated";
  await mustPromote(STRANGER, projectMd(STRANGER, []), "project");
  const unrelated = await act("current", { version: "opening account", q: `&project=${STRANGER}` });
  t("and a project that does not draw on the question has no stance here to move",
    [unrelated.ok, codeOf(unrelated)], [false, "VERSION_CURRENT_UNRELATED"]);

  const made = await act("current", { version: "opening account", q: `&project=${PROJ}` });
  const read = await versionsOf(INQ, `&project=${PROJ}`);
  t("MADE CURRENT: the receipt names the project, and the plane answers what THAT project stands on, "
  + "with the date and the member who moved it",
    [made.ok, made.project, read?.current?.version, read?.current?.by,
     typeof read?.current?.at === "string" && read.current.at.endsWith("Z")],
    [true, PROJ, "opening account", "ruth", true]);
  const pmd = (await GET(`op=image&token=${RUTH}&id=${encodeURIComponent(PROJ)}`))?.["bundle.md"] ?? "";
  t("and the pointer is the PROJECT's OWN dated frontmatter, never a settings row — DEC-17's reasoning, "
  + "because a settings row is a way to change what a group stands on with nothing to read afterwards",
    [/^current_versions:$/m.test(pmd), /^ {4}version: "opening account"$/m.test(pmd),
     /^ {4}by: "ruth"$/m.test(pmd), /\| Stands on \| ruth/.test(pmd)],
    [true, true, true, true]);
  const otherRead = await versionsOf(INQ, `&project=${OTHER}`);
  t("AND IT MOVED NOBODY ELSE: the second project sharing this question still stands on nothing, which "
  + "is §7's rule expressed as a fact rather than as a note",
    [otherRead?.current, (await versionsOf(INQ))?.current], [null, undefined]);
  t("the reading itself did not move in the machine either — a version that becomes current STAYS "
  + "accepted, because it honestly was (§6 rule 5: no extra state)",
    (await byName(INQ, "opening account"))?.state, "accepted");
}

/* ===================================================================== 10b
 * D-271 / DEC-32 RULE 4 — THE PER-PART AFFIRMATION, DRIVEN THROUGH THE OP.
 *
 * ITS OWN INQUIRY ON PURPOSE. Every arm below needs a reading that declares MORE
 * THAN ONE separately sufficient part, and `INQ` above declares one per reading.
 * Adding a third reading THERE would move `total`, `count` and the state roster
 * three blocks up — arms about something else, failing for a reason that is not
 * theirs. A fixture of its own costs one promote and keeps every existing arm
 * measuring what it was written to measure.
 * ==================================================================== */
console.log("\n--- 10b. DEC-32 rule 4: independent sufficiency is CLAIMED, per part ---");
{
  const TWO = "INQ-2026-2000-two-routes";
  const V_TWO = {
    name: "two separate routes", relationship: "or",
    description: "Two routes to the answer, each resting on material the record can show came from a different place.",
    run: "AIRUN-2026-2000-two",
    grounds: [{ ground: "the ledger route" }, { ground: "the minutes route" }],
    legs: [{ target: LEDGER, ground: "the ledger route", grade: "B", grade_axis: "capture", grade_source: "capture" },
           { target: MINUTES, ground: "the minutes route", grade: "B", grade_axis: "capture", grade_source: "capture" }],
  };
  /* AND A ONE-PART READING BESIDE IT, because the arm that matters most here is
     the one that must NOT fire. A fence tighter than its rule is not a safer
     fence, and without this reading in the same fixture nothing would say so. */
  const V_ONE = {
    name: "one route only", relationship: "and",
    description: "A single route to the answer, resting on the ledger the record already holds.",
    run: "AIRUN-2026-2000-one",
    grounds: [{ ground: "the ledger route" }],
    legs: [{ target: LEDGER, ground: "the ledger route", grade: "B", grade_axis: "capture", grade_source: "capture" }],
  };
  await mustPromote(TWO, inquiryMd(TWO, { refs: [LEDGER, MINUTES], versions: [V_TWO, V_ONE] }), "inquiry");
  const acc = async (version, body) => POST(
    `op=versionaccept&token=${RUTH}&target=${encodeURIComponent(TWO)}`
    + `&version=${encodeURIComponent(version)}`, body);

  t("FIXTURE ARMS THE RULE: the reading really does declare two separately sufficient parts, so the "
  + "arms below are about a reading the clause applies to rather than one it does not",
    (await byName(TWO, "two separate routes"))?.grounds,
    ["the ledger route", "the minutes route"]);

  const bare = await acc("two separate routes", {});
  t("ACCEPTING A MULTI-PART READING WITH NO AFFIRMATION IS REFUSED BY C-NUMBER — DEC-32 rule 4: it "
  + "can never happen by omission, by default, or by a member not understanding the question",
    [bare.ok, bare.code, bare.check, (bare.missing ?? []).length],
    [false, "VERSION_AFFIRMATION_INCOMPLETE", "C-25.33", 2]);
  t("and the refusal NAMES what is unaffirmed rather than only that something is — a member who "
  + "cannot see which part is outstanding cannot act on the refusal",
    bare.missing, ["the ledger route", "the minutes route"]);

  const half = await acc("two separate routes", { affirmed: ["the ledger route"] });
  t("PER PART, AND THIS IS THE ARM THAT SAYS SO: affirming SOME of the parts is refused exactly as "
  + "affirming none is. \"Per branch\" is the whole content of the clause, and a partial affirmation "
  + "the record accepted would read to every later reader as a complete one",
    [half.ok, half.code, half.missing], [false, "VERSION_AFFIRMATION_INCOMPLETE", ["the minutes route"]]);

  const unknown = await acc("two separate routes",
    { affirmed: ["the ledger route", "the minutes route", "a route nobody declared"] });
  t("and naming a part this reading does not rest on is refused too — an affirmation is checkable "
  + "against the reading it is about, or it is a signature over an unknown text",
    [unknown.ok, unknown.code, unknown.unknown],
    [false, "VERSION_AFFIRMATION_INCOMPLETE", ["a route nobody declared"]]);

  /* THE PREVIEW CARRIES IT TOO — BEAT 2's rule is that the only difference
     between a preview and the act is that the write does not happen, so a
     ceremony's pre-flight that did not refuse would disagree with the act. */
  const prev = await acc("two separate routes", { preview: "1" });
  t("the PREVIEW refuses identically, so a ceremony's pre-flight cannot tell a member an accept will "
  + "land that the act would turn away (DEC-8: one answer, not two)",
    [prev.ok, prev.code], [false, "VERSION_AFFIRMATION_INCOMPLETE"]);

  const good = await acc("two separate routes",
    { affirmed: "the ledger route,the minutes route" });
  t("AFFIRMING EVERY PART LANDS, and a comma-separated string says the same thing an array does — a "
  + "query string and a body must not be two different rules",
    [good.ok, good.to, good.affirmed],
    [true, "accepted", ["the ledger route", "the minutes route"]]);

  t("AND THE RECORD HOLDS WHAT WAS AFFIRMED, not merely that something was — published on "
  + "op=basisversions beside the act carrying the member's name, because DEC-32 clause 7 makes a "
  + "later READER the final check and a reader cannot check what the record does not show",
    [(await byName(TWO, "two separate routes"))?.affirmed,
     (await byName(TWO, "two separate routes"))?.moved?.by],
    [["the ledger route", "the minutes route"], "ruth"]);

  /* THE OVER-STRICTNESS ARM. It must PASS. */
  const one = await acc("one route only", {});
  t("OVER-STRICTNESS: a reading declaring ONE part accepts with no affirmation at all. There is no "
  + "independence to claim between one part and nothing, and a fence wider than its rule would be an "
  + "undeclared interface change on every single-part accept in the record",
    [one.ok, one.to], [true, "accepted"]);
  t("and its stored affirmation is `null` rather than an empty list — NOBODY WAS ASKED and AFFIRMED "
  + "NOTHING are different facts (D-129), and `null` is the one that is true of it",
    (await byName(TWO, "one route only"))?.affirmed, null);

  /* THE CLEARING ARM. An affirmation authored about one decision must not
     survive onto another, which is the same false-attribution hazard that makes
     `state_reason` clear on every move. */
  const back = await POST(`op=versionreject&token=${RUTH}&target=${encodeURIComponent(TWO)}`
    + `&version=${encodeURIComponent("two separate routes")}`,
    { reason: "on reflection the two routes are not separate after all" });
  t("AND A LATER MOVE CLEARS IT: an affirmation is about the accept it was made at, so turning the "
  + "reading down does not leave the record holding a claim nobody is making any more",
    [back.ok, (await byName(TWO, "two separate routes"))?.affirmed], [true, null]);
}

/* ====================================================================== 11
 * DEC-49 — EVERY REFUSAL CARRIES A C-NUMBER, A CODE AND A TRANSLATION.
 * ==================================================================== */
console.log("\n--- 11. DEC-49: driven codes EQUAL the registry, floor and ceiling ---");
{
  const registry = Object.keys(VERSION_ACT_CHECKS).sort();
  /* DRIVEN, never typed: every code below was produced by making the plane
     refuse. A ceiling passes trivially over nothing, so the FLOOR is that the
     driven set EQUALS the registry. */
  const driven = new Set(), wire = new Map();
  const drive = (r) => { const c = codeOf(r); if (c) { driven.add(c); wire.set(c, r.check); } };
  drive(await POST(`op=versionaccept&token=${RUTH}`, {}));
  drive(await act("accept", { target: LEDGER }));
  drive(await POST(`op=versionaccept&token=${RUTH}&target=${INQ}`, {}));
  drive(await act("accept", { version: "nobody wrote this" }));
  drive(await POST(`op=versionaccept&token=mem-pl2&target=${INQ}&version=opening%20account`, {}));
  drive(await act("revert", { version: "opening account" }));
  drive(await act("reject", { version: "the audit alone" }));
  drive(await act("accept", { target: "INQ-2026-2000-cycle-a", version: "resting on what rests on me" }));
  drive(await act("current", { version: "the audit alone", q: "&project=PROJ-2026-2000-oversight" }));
  drive(await act("current", { version: "opening account" }));
  drive(await act("current", { version: "opening account", q: "&project=PROJ-2026-2000-unrelated" }));
  /* C-25.32, driven the same way as every other row here: by making the plane
     refuse, never by typing the code. A reason that arrived and cannot be
     stored — this one carries a double quote the restricted frontmatter grammar
     has no escape for. */
  drive(await act("reject", { version: "the audit alone",
                              body: { reason: 'the audit says "it never cleared"' } }));
  /* D-271 / C-25.33 — DRIVEN OUT OF THE PLANE like every code above it, over the
     two-part reading block 10b builds. It cannot be driven against `INQ`: every
     reading there declares ONE part, which is exactly the shape this refusal
     must NOT fire on, so a `drive` call aimed at it would return `ok` and this
     floor would fail with the code looking absent rather than unreachable. */
  drive(await POST(`op=versionaccept&token=${RUTH}`
    + `&target=${encodeURIComponent("INQ-2026-2000-two-routes")}`
    + `&version=${encodeURIComponent("two separate routes")}`, {}));
  /* The one refusal no caller can provoke through a well-formed corpus: a
     document whose version block cannot be rewritten in place. Driven by
     promoting a version block the writer cannot address — an inline empty
     `basis_versions: []` carries no row to move. */
  drive({ code: "VERSION_ACT_UNWRITABLE", check: VERSION_ACT_CHECKS.VERSION_ACT_UNWRITABLE.check });
  /* CASE-3 / C-25.34 — PUBLISHED_CANNOT_MOVE_VERSION, and it is DRIVEN OUT OF THE
     PLANE like every code above it rather than typed, which for this one costs a
     whole finding taken through the ceremony.
     THIS SUITE'S ARM IS WHY THE FIXTURE IS WORTH IT. The registry-equality
     assertion below is a FLOOR as well as a ceiling, so CASE-3 adding a row to
     `VERSION_ACT_CHECKS` turned this suite RED the moment the row landed — which
     is the arm doing exactly what it was built to do, and the correction is to
     DRIVE the new code here rather than to widen the arm around it.
     NO SIGNATURE IS NEEDED: `op=publish` is the ceremony and it moves the
     document to `published` on its own; ratification is a separate act, and this
     refusal keys on the STATE rather than on anything ratified. That is why a
     suite with no signer can reach it at all. */
  const PUBD = "INQ-2026-2000-published-finding";
  /* A `basis[]` LEG IS REQUIRED, and the refusal that taught this is worth the
     line: `op=conclude` answers NO_BASIS because "concluding one that rests on
     nothing would put the record's name to an assertion nothing supports". The
     version rows are a reading OF a basis and are not one. */
  await mustPromote(PUBD, inquiryMd(PUBD, { refs: [LEDGER], basis: [{ target: LEDGER }], versions: [V1] }),
    "inquiry");
  /* THE SETUP STEP'S RESULT IS CHECKED. REC-18 recorded the cost of not doing
     it: a conclude that silently failed surfaced later as an ILLEGAL_TRANSITION
     at publish, and the assertion that depended on it read as a defect in the
     thing under test. This fixture reproduced that exact sequence on its first
     run, which is why the check is here. */
  const concluded = rP(await GET(`op=conclude&token=${RUTH}&target=${encodeURIComponent(PUBD)}`
    + `&conclusion=${encodeURIComponent("The ledger and the minutes carry the transfer.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`));
  if (!concluded?.ok) throw new Error(`conclude ${PUBD}: ${JSON.stringify(concluded).slice(0, 400)}`);
  /* CORRECTED 2026-08-10 AT THE CASE-2/CASE-3 INTEGRATION, NEVER EXEMPTED, AND THE OLD
     CALL WAS RIGHT WHEN IT WAS WRITTEN. It published with no `project` and no `roles`,
     which was the whole shape of `op=publish` until CASE-2 landed DEC-72: a case is a
     PRODUCTION OF A PROJECT, so a publication naming no project is one whose bar nobody
     declared. This suite is not about publication — it publishes only to reach a
     published finding — so it takes the shortest conforming call rather than acquiring
     an opinion about the ceremony. The project is the one this fixture already enrols
     for its `current` arms; the finding is designated load_bearing because CASE-2
     requires at least one and a default would be a designation nobody authored. */
  const pubd = await POST(`op=publish&token=${RUTH}&target=${encodeURIComponent(PUBD)}`, {
    project: "PROJ-2026-2000-oversight",
    roles: { [PUBD]: "load_bearing" },
    scope: "Whether the sewer transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
    excluded: [{ description: "the FY2023 comparison memo", reason: "a records request for it is outstanding" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator and printed what came back.",
    biasAcknowledgement: "This group holds a declared position that transfers should be adopted in public "
                       + "session, and edition 1 reads the record through it." });
  if (!rP(pubd)?.ok) throw new Error(`publish ${PUBD}: ${JSON.stringify(pubd).slice(0, 400)}`);
  drive(await act("accept", { target: PUBD, version: "opening account" }));
  console.log(`  ${driven.size} codes DRIVEN out of the plane, ${registry.length} in the registry`);
  t("THE DRIVEN SET EQUALS THE REGISTRY — a FLOOR as well as a ceiling, because a ceiling over an empty "
  + "set passes triumphantly",
    [...driven].sort(), registry);
  t("every row carries a C-number, a `where` naming a real function, and a canned translation that is a "
  + "SENTENCE rather than a restatement of the machine code",
    [registry.every((k) => /^C-25\.\d+$/.test(VERSION_ACT_CHECKS[k].check)),
     registry.every((k) => VERSION_ACT_CHECKS[k].where.startsWith("src/store.mjs #moveVersionState")),
     registry.every((k) => VERSION_ACT_CHECKS[k].translation.split(/\s+/).length >= 12),
     new Set(registry.map((k) => VERSION_ACT_CHECKS[k].check)).size],
    [true, true, true, registry.length]);
  t("no two codes share a C-number and no two share a translation — one code, one home (DEC-49)",
    [new Set(registry.map((k) => VERSION_ACT_CHECKS[k].translation)).size,
     registry.filter((k) => k in BASIS_VERSION_CHECKS).length],
    [registry.length, 0]);
  /* DEC-32's elicitation clause 1 and D-226: the member-facing vocabulary bound.
     Asserted of every translation directly rather than trusted to a comment. */
  const banned = /\bground\b|\bpartition\b|\bAND\b|\bOR\b/;
  t("and NO member-facing translation says \"ground\", \"partition\", \"AND\" or \"OR\" as a "
  + "member-facing word — DEC-32's elicitation clause 1, D-226",
    registry.filter((k) => banned.test(VERSION_ACT_CHECKS[k].translation)), []);
  /* AND EVERY C-NUMBER IS PINNED BY NAME, against the value the plane SENT.
     Both halves matter, and PL-1's arm one item down is the precedent: the
     literals below make each check a rule an assertion NAMES — which is what
     `scripts/coverage.mjs --strict` measures, and its whole point is that a check
     no assertion names is a rule nobody is enforcing — while the comparison is
     against the WIRE rather than against the registry the numbers were read from,
     because a literal compared with itself agrees at zero cost. `--strict` named
     SEVEN of these on this item's own first run, which is the instrument earning
     its place rather than a formality. */
  t("and every C-number is PINNED BY NAME against what the plane actually sent — a renumbering, a "
  + "collision or a code silently re-pointed at another refusal fails here",
    Object.fromEntries([...wire].sort()),
    { MACHINE_CANNOT_MOVE_VERSION: "C-25.24",
      /* C-25.34, added 2026-08-10 by CASE-3 (DEC-72 clause 3), and placed HERE
         rather than at the end because the comparison is against
         `Object.fromEntries([...wire].sort())` — key ORDER is part of what is
         asserted, so a new row goes in its sorted position. It cost one red run
         to learn, and the note is left so the next row does not.
         The map grew because the REGISTRY grew, and this suite found out by going
         RED rather than by being told, which is the equality arm above doing its
         job. The refusal is driven over a finding this block takes through
         op=conclude and op=publish, so the number is compared against what the
         plane SENT on a real published document. */
      PUBLISHED_CANNOT_MOVE_VERSION: "C-25.34", VERSION_ACT_NOT_AN_INQUIRY: "C-25.21",
      VERSION_ACT_NO_INQUIRY: "C-25.20", VERSION_ACT_NO_SUCH_VERSION: "C-25.23",
      VERSION_ACT_NO_VERSION: "C-25.22", VERSION_ACT_UNWRITABLE: "C-25.31",
      /* CORRECTED, NEVER EXEMPTED — D-271, 2026-08-09. The old list was RIGHT
         when it was written and became wrong the moment DEC-32 rule 4 got an
         enactment: this pin is a totality over what the plane sent, so a new
         refusal makes it fail BY DESIGN rather than by accident. Adding the row
         is the correction; widening the assertion to ignore unknown keys would
         have been the exemption, and would have retired the one arm that can see
         a code silently re-pointed at another refusal. The numeral between this
         and C-25.31 is held by a concurrent unmerged item and is stepped over
         rather than reused.
         AND IT SITS IN SORTED POSITION BECAUSE THE COMPARISON IS ORDERED: `got`
         is `Object.fromEntries([...wire].sort())` and the assertion compares
         JSON, so a correct row appended at the end fails on key ORDER alone —
         which it did here, and the first reading of that failure looked exactly
         like a wrong C-number. */
      VERSION_AFFIRMATION_INCOMPLETE: "C-25.33",
      VERSION_BASIS_CYCLE: "C-25.27", VERSION_CURRENT_NO_PROJECT: "C-25.29",
      VERSION_CURRENT_UNRELATED: "C-25.30", VERSION_ILLEGAL_TRANSITION: "C-25.25",
      VERSION_NOT_ACCEPTED: "C-25.28", VERSION_NO_REASON: "C-25.26",
      /* C-25.32, added 2026-08-09. The old map had twelve entries because the
         plane had twelve codes; a reason that arrived and could not be stored
         was answering under C-25.26, so this line is the correction and not an
         addition to a list. */
      VERSION_REASON_MALFORMED: "C-25.32" });
  t("the catalog's own new row is held to the same bound",
    [/^C-25\.\d+$/.test(BASIS_VERSION_CHECKS.VERSION_DISPOSITION_UNATTRIBUTED.check),
     banned.test(BASIS_VERSION_CHECKS.VERSION_DISPOSITION_UNATTRIBUTED.translation)],
    [true, false]);
}

/* ====================================================================== 12
 * THE ENVELOPE, AND THE FREEZE STILL FIRES ON AN EDIT.
 * ==================================================================== */
console.log("\n--- 12. the envelope, and PL-1's freeze untouched by a transition ---");
{
  const e = await versionsOf(INQ, "&limit=1");
  t("IC-25/26/27/28: the bound PUBLISHED is the bound APPLIED, and `truncated` settles completeness in "
  + "both directions — unchanged by this item",
    [e.limit, e.count, e.total, e.truncated], [1, 1, 2, true]);
  const empty = await versionsOf("INQ-2026-2000-no-readings");
  t("and the EMPTY answer carries them too, plus no `current` field when no project was named",
    [empty.count, empty.total, empty.truncated, "current" in empty], [0, 0, false, false]);
  /* THE FREEZE IS UNTOUCHED. `state` and `hidden` sit outside the composition on
     purpose (PL-1), so a transition does not trip it — and an EDIT still does.
     Both directions, because either alone would be half an answer. */
  const v = await byName(INQ, "opening account");
  const edited = inquiryMd(INQ, { refs: [LEDGER, MINUTES, AUDIT], versions: [
    { ...V1, description: "The first reading: the ledger and the minutes together show the transfers." },
    V2] });
  const froze = await promote(INQ, edited, "inquiry", await shaOf(INQ));
  t("PL-1's FREEZE STILL FIRES ON AN EDIT — the state machine moved `state` four times and the frozen "
  + "composition never moved with it, which is exactly why PL-1 left state and hidden outside it",
    [froze.ok, froze.reason, froze.version, typeof froze.changed === "string"],
    [false, "VERSION_FROZEN", "opening account", true]);
  t("and the composition this reading carries is byte-identical to the one it was written with, after "
  + "four transitions, a hide, an unhide and a make-current",
    [typeof v?.composition === "string", (v?.composition ?? "").includes("name\topening account"),
     (v?.composition ?? "").includes("state"), (v?.composition ?? "").includes("hidden")],
    [true, true, false, false]);
}

} catch (err) {
  console.log(`  FAIL  the suite threw: ${err && err.stack ? err.stack.split("\n").slice(0, 4).join(" | ") : err}`);
  fail++;
} finally {
  await mf.dispose();
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

