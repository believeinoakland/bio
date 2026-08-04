/* NEGATIVE CONTROL: in checks/bio-checks.mjs checkEarnedLeg, neuter `if (earned.grade !== leg.grade) {` to `if (false) {` -> op=promote accepts a caller's own letter on a `grade_source: resolution` leg and 4 assertions fail, including the one that catches op=earnedbasis and op=promote drifting apart. Three arms in full below, each RUN. */
/* THE THREE ARMS (run 2026-08-04, rec18-agent, each broken ALONE in checks/bio-checks.mjs and restored byte-identically; 52 pass and battery 91/91 (4799) when whole)

   (a) THE ITEM'S OWN — LET THE CALLER HAND US THE GRADE. In checkEarnedLeg replace the value comparison `if (earned.grade !== leg.grade) {` with `if (false) {` -> earnedbasis 48 pass, 4 FAIL; battery 90/91 (4795), earnedbasis the only failing suite. The four, and they are the four that matter: "a leg claiming C where the record earns A is refused too — an earned grade is not a caller's to lower" got [true,[]] where [false,["C-2.8"]] was wanted, so op=promote ACCEPTED a caller's C over a document the recogniser matched at A; its companion assertion that the refusal NAMES BOTH LETTERS goes with it; and in block 6 "a grade the READ does not report is a grade the WRITE does not accept" got ["A",true] — op=earnedbasis still correctly reports A while op=promote now accepts B, which is the read and the enforcer DRIFTING APART, measured. THE FINDING: with this one comparison gone, `grade_source: resolution` degrades to exactly what D1(a) was — a label a caller picks — while the vocabulary, the axis pairing, the subject-entity refusal and every testimony assertion still pass. The subject of this item is the COMPARISON, not the word.

   (b) THE TESTIMONY CEILING — the queue item's own named control. `if (leg.grade_source === 'testimony' && graded && leg.grade !== 'D')` -> `if (false)` -> earnedbasis 51 pass, 1 FAIL; battery 89/91 (4794), and it takes basis.test.mjs down with it. The failure is the whole sweep at once: "it CANNOT be recorded at any other grade — A, B and C are each refused by name" got [["A",true,[]],["B",true,[]],["C",true,[]]] where three refusals were wanted. A caller-supplied A on a testimony leg is ACCEPTED and LANDS. REC-11's basis.test.mjs reports the same breakage from its own angle (three assertions, including the grade-with-no-source and grade-with-no-axis arms that share the loop) — which is the two items holding one rule from two places. Separable from (a): breaking either alone leaves the other's assertions green, so the write path holds the split in two independent defences rather than one.

   (c) THE CAPTURE CEILING. In checkEarnedLeg, `if (BASIS_GRADES.indexOf(leg.grade) < BASIS_GRADES.indexOf(earned.grade)) {` -> `if (false) {` -> earnedbasis 51 pass, 1 FAIL; battery 90/91 (4798). "grade A on the capture axis is UNREACHABLE" got [true,false]: a leg claiming capture grade A over a directly captured document is ACCEPTED, against the landed doctrine that grade A needs a chain-of-custody web archive this plane cannot produce and does not claim (CAPTURE-FIDELITY.md; R2-e/R2-g). One assertion and one suite, which is itself worth recording — nothing else in the battery notices a capture grade the record cannot support, and this arm is the only thing standing between the record and it.

   Restored after each, byte-identically; 91/91 (4799) and coverage --strict exit 0 afterwards. */
/* REC-18: EARNED BASIS GRADES — `grade_source: 'resolution'` from `resolutions`.
 *
 * `research/RECONCILED.md` §3.1 (REC-18) and `DATA-MODEL.md` D1(b) are the
 * design; DEC-15 is the ruling that closed the fork, and it closed it by saying
 * the fork was false: EARNED and AUTHORED are not two answers, they are two
 * PHASES of one lifecycle. During `open` a connection grade may be authored —
 * that is a HUNCH, and it is bias debt. The EARNED path this item builds is what
 * a hunch is CLEARED INTO.
 *
 * THE RULE, and it is the recogniser's own precedent moved up one layer
 * (`schema.mjs:739-743` — "the RECOGNISER never mints a D; the model holds it so
 * a member can testify, never the machine"):
 *
 *   grade_source     axis        who decides          values
 *   ----------------------------------------------------------------------
 *   resolution       connection  the RECORD (earned)  A/B/C, never D
 *   capture          capture     the RECORD (earned)  no stronger than B
 *   testimony        connection  a MEMBER             D and nothing else
 *   hunch            connection  a MEMBER             any, bias debt (DEC-15)
 *
 * Enforced by the WRITE PATH, through the ONE catalog function both gates run
 * (`checkInquiryBasis` -> `checkEarnedLeg`), because an equality a caller can
 * hand us is one a caller can invent (CLAUDE.md).
 *
 * What is asserted, each in the direction that fails:
 *   1. THE SUBJECT ENTITY. An inquiry names one, optionally, as `subject_entity`
 *      (an ENT- key). A key the registry does not hold is refused at the write;
 *      a malformed one is refused by the catalog; naming none is LEGAL and costs
 *      exactly what DEC-15 says it costs — no A/B/C on the connection axis.
 *   2. THE EARNED CONNECTION GRADE. A document resolved to the subject at grade
 *      A through `op=resolve` carries `grade_source: 'resolution'` and grade A on
 *      `inquiry_basis`. A leg claiming any OTHER letter is refused in EITHER
 *      direction, naming what the record earns.
 *   3. TESTIMONY IS ALWAYS D. A member's testimony on the same leg carries
 *      'testimony' and D and is refused at A, B and C. And a document known to
 *      the record only through a grade-D RESOLUTION earns nothing: the machine
 *      never mints a D at this layer either.
 *   4. THE CLEARED HUNCH (DEC-15). A leg authored as a hunch, then cleared by
 *      re-promotion, reads `resolution` at the grade the record earns, carries no
 *      bias debt on the axis, and the HUNCH'S AUTHOR AND DATE ARE STILL IN THE
 *      RECORD — in the prior revision's bytes, which `op=image` serves. Nothing
 *      silently vanishes.
 *   5. THE CAPTURE AXIS IS NEVER AUTHORED. It is earned from the capture record:
 *      a document with no captures earns nothing, grade A is unreachable, and
 *      testimony and hunches are refused as sources for it.
 *   6. ONE RULE, TWO GATES, AND A READ THAT CANNOT DRIFT FROM IT.
 *      `op=earnedbasis` answers from the SAME store function the write path
 *      enforces with — so a member can learn what a leg earns BEFORE writing it,
 *      which is what keeps the refusal from being a gate that pressures someone
 *      into inventing a grade.
 *
 * Everything is driven THROUGH the control plane (op=…, a real caller's only
 * route), so coverage credits the control-plane surface and not only the store
 * (the D-43 class).
 *
 * DEC-23's provisional stands: a leg's target is an INFO-/INQ- id, because the
 * content-extent primitive is parked at D-164.
 * REC-36 is NOT landed, and it bounds this: candidate reachability is limited to
 * documents whose readings carry an EXACT reference match, because nothing
 * indexes `reading_refs.label`. A document that mentions the subject only by
 * name cannot be found — so it earns nothing here, not because it concerns the
 * subject any less, but because the plane cannot yet be asked.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r18", MEMBER_TOKEN: "mem-r18", PROBE_TOKEN: "prb-r18", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r18") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r18") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";

/* ------------------------------------------------------------- documents */

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
/* A leg renders exactly the keys it carries, so an ABSENT grade is absent in
   the document too — undetermined, stated by the absence, never invented. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.note ? [`    note: "${l.note}"`] : [])])]
  : [];

const inquiryMd = (id, { question = `What does ${id} rest on?`, subject = null,
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
  /* REC-18: the subject-entity linkage, and it is ONE optional scalar. */
  ...(subject ? [`subject_entity: ${subject}`] : []),
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

let snapSeq = 0;
const promote = async (id, text, type, { base = null, register = [], reading = null,
                                         replay = false } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base, replay,
    snapKey: `20260804T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
};
const mustPromote = async (id, ...a) => {
  const r = await promote(id, ...a);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};
/* ONE LEG, AS `inquiry_basis` HOLDS IT. `op=inquirystrength` is the gated read of
   REC-12's derivation, and its members are projected straight off the table — so
   the grade and the grade_source it names for a leg are the projected row's, not
   the document's. The GRADED entry is preferred over the inert one deliberately:
   a connection leg appears on BOTH axes, load-bearing on its own and named as
   not-load-bearing on the other (with grade null, correctly), and reading the
   inert copy would report every leg as ungraded. */
const legOf = async (id, target) => {
  const s = await get("inquirystrength", `id=${id}`);
  for (const ax of ["capture", "connection"])
    if (s[ax]?.weakest?.target_id === target) return s[ax].weakest;
  for (const ax of ["capture", "connection"])
    for (const m of s[ax]?.not_load_bearing ?? []) if (m.target_id === target) return m;
  return null;
};
const hunchLegs = async (id) => {
  const s = await get("inquirystrength", `id=${id}`);
  return [...["capture", "connection"].map((ax) => s[ax]?.weakest).filter(Boolean),
          ...["capture", "connection"].flatMap((ax) => s[ax]?.not_load_bearing ?? [])]
    .filter((m) => m.grade_source === "hunch");
};
const errorsOf = async (id, text, earned) => {
  const { findings } = await checkBundle({ folderName: id,
    files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true, earnedRegistry: earned });
  return findings.filter((x) => x.severity === "error").map((x) => x.check);
};
const checks = (r) => (r.findings || []).map((f) => f.check);
const details = (r) => (r.findings || []).map((f) => f.detail).join(" || ");

/* ============================ THE REGISTRY AND THE DOCUMENTS ============ */

console.log("--- 0. the ground: a registry subject, and captured documents that reference it ---");
/* The subject carries the source's COMPOSITE key as an alias, so a reference of
   that exact key grades A — the strongest rung of framework §8.1, and the one
   the whole item is about being unable to fake. */
const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:13579"] });
const ORD = eOrd.entity_id;
/* A second subject carrying only a NAME, so a reference to it can only ever
   reach grade C — correspondence, never established. It is what proves the
   earned grade tracks the recogniser rather than the fixture. */
const ePerson = await post("entitycreate", { kind: "person", label: "The Finance Director" });
const PERSON = ePerson.entity_id;
t("two subjects are registered, with distinct ids", new Set([ORD, PERSON]).size, 2);

const SHA_A = sha("doc-earns-A");
const SHA_C = sha("doc-earns-C");
const SHA_T = sha("doc-only-testimony");
const DOC_A = "INFO-2026-1800-earns-a";
const DOC_C = "INFO-2026-1800-earns-c";
const DOC_T = "INFO-2026-1800-testimony-only";
const DOC_BARE = "INFO-2026-1800-no-capture";

const readingOf = (captureSha, entities) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
             at: NOW, entities } });

await mustPromote(DOC_A, infoMd(DOC_A), "information", {
  reading: readingOf(SHA_A, [{ ref: "ordinance:13579", kind: "ordinance", key: "13579",
                               label: "Ordinance No. 13579" }]),
  register: [{ path: "snapshots/a.bin", sha256: SHA_A, encoding: "binary", bytes: 10 }] });
await mustPromote(DOC_C, infoMd(DOC_C), "information", {
  reading: readingOf(SHA_C, [{ ref: "person:42", kind: "person", key: "42",
                               label: "The Finance Director" }]),
  register: [{ path: "snapshots/c.bin", sha256: SHA_C, encoding: "binary", bytes: 10 }] });
await mustPromote(DOC_T, infoMd(DOC_T), "information", {
  reading: readingOf(SHA_T, [{ ref: "parcel:999", kind: "parcel", key: "999",
                               label: "A parcel nobody registered" }]),
  register: [{ path: "snapshots/t.bin", sha256: SHA_T, encoding: "binary", bytes: 10 }] });
/* NO capture and NO reading: the record holds this document's TEXT and nothing
   about how any bytes arrived. Its capture axis has nothing to measure. */
await mustPromote(DOC_BARE, infoMd(DOC_BARE), "information");

const rA = await post("resolve", { captureSha: SHA_A });
t("op=resolve grades the composite-key reference A — the machine's own act, over the record",
  [rA.resolved_count, rA.resolved[0].grade, rA.resolved[0].entity_id], [1, "A", ORD]);
const rC = await post("resolve", { captureSha: SHA_C });
t("and a NAME correspondence grades C, never established (an equality that costs nothing)",
  [rC.resolved[0].grade, rC.resolved[0].entity_id, rC.resolved[0].established], ["C", PERSON, false]);
const rT = await post("resolve", { captureSha: SHA_T });
t("a reference matching no entity stays honestly UNRESOLVED — never force-matched",
  [rT.resolved_count, rT.unresolved_count], [0, 1]);

/* ============================ 1. THE SUBJECT ENTITY ===================== */

console.log("\n--- 1. the subject-entity linkage: one optional scalar, refused if it names nothing ---");
{
  const GHOST = "INQ-2026-1800-ghost-subject";
  const ghost = await promote(GHOST, inquiryMd(GHOST,
    { question: "About a subject nobody registered?", subject: "ENT-2026-9999" }), "inquiry");
  t("an inquiry naming a subject the registry does not hold is REFUSED at the write",
    [ghost.ok, ghost.reason, ghost.target], [false, "SUBJECT_REFUSED", "ENT-2026-9999"]);
  t("and the refusal says what to do about it rather than only that it happened",
    /SUBJECT REGISTRY/.test(details(ghost)) && /op=entitycreate/.test(details(ghost)), true);
  t("the refused write projected NOTHING: the bundle does not exist",
    (await get("earnedbasis", `id=${GHOST}`)).reason, "NO_SUCH_BUNDLE");

  const MAL = "INQ-2026-1800-malformed-subject";
  const malMd = inquiryMd(MAL, { question: "About a subject spelled wrong?", subject: "ordinance-13579" });
  t("a subject that is not an ENT- key is refused by the CATALOG — a shape fact about the bytes",
    await errorsOf(MAL, malMd), ["C-2.8"]);

  const NONE = "INQ-2026-1800-no-subject";
  await mustPromote(NONE, inquiryMd(NONE, { question: "A question about nothing in the registry?" }), "inquiry");
  const e = await get("earnedbasis", `id=${NONE}`);
  t("naming NO subject is LEGAL, and the read says so plainly rather than erroring",
    [e.ok, e.subject_entity, /names NO subject entity/.test(e.detail)], [true, null, true]);
  t("and it states the CONSEQUENCE, which is DEC-15's own: no A/B/C is available on the connection axis",
    /no leg of it earns an A\/B\/C connection grade/.test(e.detail), true);
}

/* ============================ 2. THE EARNED CONNECTION GRADE ============ */

const CASE = "INQ-2026-1800-case";
console.log("\n--- 2. the EARNED connection grade: computed by the record, not handed to it ---");
{
  /* THE READ COMES FIRST, deliberately: this is the order a member works in, and
     the whole reason the op exists. A write path that refuses a value a caller
     has no way to learn is a gate that pressures someone into inventing one. */
  const case0 = inquiryMd(CASE, { question: "Was the sewer transfer authorised?", subject: ORD });
  await mustPromote(CASE, case0, "inquiry");
  const pre = await get("earnedbasis", `id=${CASE}&targets=${DOC_A},${DOC_C},${DOC_T},${DOC_BARE}`);
  t("op=earnedbasis names the subject the question declares",
    [pre.ok, pre.subject_entity, pre.subject_label], [true, ORD, "Sewer Fund Transfer Ordinance"]);
  t("it earns A for the document the recogniser matched on the source's own composite key",
    [pre.earned.connection[DOC_A]?.grade, pre.earned.connection[DOC_A]?.mode], ["A", "value"]);
  t("and NOTHING for documents that resolve to a DIFFERENT subject, or to none",
    [DOC_C in pre.earned.connection, DOC_T in pre.earned.connection], [false, false]);
  t("the capture axis is answered separately, as a CEILING and never as a value",
    [pre.earned.capture[DOC_A]?.grade, pre.earned.capture[DOC_A]?.mode], ["B", "ceiling"]);
  t("a document the record holds NO bytes for earns nothing on the capture axis either",
    DOC_BARE in pre.earned.capture, false);

  const leg = (grade) => ({ refs: [DOC_A], legs: [{ target: DOC_A, role: "supports",
    grade, axis: "connection", source: "resolution" }] });
  const good = inquiryMd(CASE, { question: "Was the sewer transfer authorised?", subject: ORD, ...leg("A") });
  t("THE ITEM: a leg resolving to the subject at A carries grade A and grade_source 'resolution'",
    (await promote(CASE, good, "inquiry", { base: sha(case0) })).ok !== false, true);
  const earnedLeg = await legOf(CASE, DOC_A);
  t("and it reads back off inquiry_basis that way — the grade AND the account of it",
    [earnedLeg?.grade ?? null, earnedLeg?.grade_source ?? null], ["A", "resolution"]);

  /* BOTH DIRECTIONS. An earned grade is a FACT about the record at the moment of
     the write, so a caller may not raise it and may not lower it either: a
     weaker letter is not modesty, it is a false statement about how the leg was
     established. This is what separates the earned rule from `inherited`, where
     DEC-12 gives the member a real choice and "no stronger than" is right. */
  const up = await promote(`${CASE}-up`, inquiryMd(`${CASE}-up`,
    { question: "Claiming more?", subject: ORD,
      refs: [DOC_C], legs: [{ target: DOC_C, role: "supports", grade: "A",
                              axis: "connection", source: "resolution" }] }), "inquiry");
  t("a leg claiming A where the record earns NOTHING for that subject is refused",
    [up.ok, checks(up)], [false, ["C-2.8"]]);
  t("and the refusal NAMES why: no A/B/C resolution of that document to this subject exists",
    /holds no A\/B\/C resolution/.test(details(up)), true);

  /* The mirror, over a document that DOES earn: claiming a weaker letter. */
  const down = await promote(`${CASE}-down`, inquiryMd(`${CASE}-down`,
    { question: "Claiming less?", subject: ORD, ...({ refs: [DOC_A],
      legs: [{ target: DOC_A, role: "supports", grade: "C", axis: "connection",
               source: "resolution" }] }) }), "inquiry");
  t("a leg claiming C where the record earns A is refused too — an earned grade is not a caller's to lower",
    [down.ok, checks(down)], [false, ["C-2.8"]]);
  t("and the refusal names BOTH letters, so a member can see the correction rather than guess it",
    /states an EARNED connection grade of C .* but the record earns A/.test(details(down)), true);

  /* A leg to an INQUIRY earns nothing: an inquiry is not a captured document, so
     there is nothing for the recogniser to have graded. */
  const onInq = await promote(`${CASE}-inq`, inquiryMd(`${CASE}-inq`,
    { question: "Resting on a question?", subject: ORD,
      refs: [CASE], legs: [{ target: CASE, role: "supports", grade: "A",
                             axis: "connection", source: "resolution" }] }), "inquiry");
  t("an EARNED resolution grade on an INQUIRY leg is refused: an inquiry has no captures to resolve",
    [onInq.ok, /is not a captured document/.test(details(onInq))], [false, true]);
}

/* ============================ 3. TESTIMONY IS ALWAYS D ================= */

console.log("\n--- 3. testimony is a MEMBER's act: grade D, and no other value ---");
{
  const testimonyLeg = (grade) => {
    const id = `INQ-2026-1800-test-${grade}`;
    return [id, inquiryMd(id, { question: `Testimony at ${grade}?`, subject: ORD,
      refs: [DOC_A], legs: [{ target: DOC_A, role: "supports", grade,
                              axis: "connection", source: "testimony" }] })];
  };
  const [okId, okMd] = testimonyLeg("D");
  t("THE ITEM: a member's testimony on the same leg carries 'testimony' and grade D, and LANDS",
    (await promote(okId, okMd, "inquiry")).ok !== false, true);
  const row = await legOf(okId, DOC_A);
  t("and it reads back as testimony at D — the same leg, a different account of it",
    [row?.grade ?? null, row?.grade_source ?? null], ["D", "testimony"]);

  /* THE SWEEP. Not one probe: every grade above D, because "always D" is a claim
     about the whole vocabulary and one sample would not test it. */
  const refusedAt = [];
  for (const grade of ["A", "B", "C"]) {
    const [id, md] = testimonyLeg(grade);
    const r = await promote(id, md, "inquiry");
    refusedAt.push([grade, r.ok, checks(r)]);
  }
  t("and it CANNOT be recorded at any other grade — A, B and C are each refused by name",
    refusedAt, [["A", false, ["C-2.8"]], ["B", false, ["C-2.8"]], ["C", false, ["C-2.8"]]]);

  /* THE OTHER HALF, and it is where the machine-never-mints-a-D rule bites at
     THIS layer: a document connected to the subject only by a member's grade-D
     RESOLUTION earns nothing. The honest leg for it is testimony, which carries
     the member's name — not an "earned" grade that would launder one member's
     assertion into a fact the record computed. */
  const td = await post("resolvetestify", { captureSha: SHA_T, ref: "parcel:999", entityId: ORD,
    basis: "the parcel is the one the ordinance rezoned; I read both documents" });
  t("op=resolvetestify records the member's grade-D resolution — the ONLY path a D enters",
    [td.ok, td.grade], [true, "D"]);
  const afterD = await get("earnedbasis", `id=${CASE}&targets=${DOC_T}`);
  t("but it earns NOTHING on a leg: the machine never mints a D here either",
    DOC_T in afterD.earned.connection, false);
  const dLeg = await promote("INQ-2026-1800-d-earned", inquiryMd("INQ-2026-1800-d-earned",
    { question: "Can a D resolution be earned?", subject: ORD,
      refs: [DOC_T], legs: [{ target: DOC_T, role: "supports", grade: "D",
                              axis: "connection", source: "resolution" }] }), "inquiry");
  t("so a leg claiming grade D as EARNED is refused — testimony is a member's act and says so",
    [dLeg.ok, /The recogniser never mints a D/.test(details(dLeg))], [false, true]);
}

/* ============================ 4. THE CLEARED HUNCH ===================== */

console.log("\n--- 4. DEC-15's lifecycle: a hunch is CLEARED INTO the earned path ---");
{
  const HUNCH_CASE = "INQ-2026-1800-hunch";
  /* PHASE ONE: the hunch. It is what makes the graph traversable before the
     evidence exists — an authored connection grade at B, carrying its author and
     its date, and announcing itself as a hunch from the moment it is made. */
  const hunchMd = inquiryMd(HUNCH_CASE, { question: "Does the memo concern the ordinance?",
    subject: ORD, refs: [DOC_A],
    legs: [{ target: DOC_A, role: "supports", grade: "B", axis: "connection",
             source: "hunch", author: "casey", date: "2026-08-03",
             note: "the dates line up and the amounts match" }] });
  await mustPromote(HUNCH_CASE, hunchMd, "inquiry");
  const before = await legOf(HUNCH_CASE, DOC_A);
  t("the hunch composes NORMALLY (DEC-15): present, load-bearing, and visibly a hunch",
    [before?.grade ?? null, before?.grade_source ?? null], ["B", "hunch"]);
  const debtBefore = (await get("inquirystrength", `id=${HUNCH_CASE}`)).connection;
  t("the axis reads at the hunch's grade — treating it as undetermined would destroy the traversability",
    [debtBefore.state, debtBefore.grade], ["graded", "B"]);

  /* PHASE TWO: clearing it. Bias debt is cleared by RE-RUNNING the evaluation
     under the current set — the leg is re-stated with the source that accounts
     for it, and what the record earns is A, not the B the hunch guessed. */
  const clearedMd = inquiryMd(HUNCH_CASE, { question: "Does the memo concern the ordinance?",
    subject: ORD, refs: [DOC_A],
    legs: [{ target: DOC_A, role: "supports", grade: "A", axis: "connection",
             source: "resolution", note: "cleared: the document carries the ordinance's own key" }] });
  const cleared = await promote(HUNCH_CASE, clearedMd, "inquiry", { base: sha(hunchMd) });
  t("THE ITEM: the hunch is CLEARED by re-promotion, and the write is accepted", cleared.ok !== false, true);
  const after = await legOf(HUNCH_CASE, DOC_A);
  t("the leg now reads 'resolution' — the bias debt is SETTLED, not merely relabelled",
    [after?.grade ?? null, after?.grade_source ?? null], ["A", "resolution"]);
  t("the cleared leg states the grade the record actually earns, which is not the grade the hunch guessed",
    [after?.grade, before?.grade], ["A", "B"]);
  t("NO HUNCH REMAINS ON THE AXIS: nothing load-bearing is still carrying bias debt",
    (await hunchLegs(HUNCH_CASE)).length, 0);

  /* AND NOTHING SILENTLY VANISHES. The record is append-only: the hunch's own
     author and date are still in the PRIOR REVISION'S BYTES, which the store
     holds in `history` and op=image serves. A cleared hunch is a thing that
     HAPPENED, and a member who wants to know who guessed what, and when, can
     still be told. */
  const img = await get("image", `id=${HUNCH_CASE}`);
  const snaps = Object.entries(img.image ?? img)
    .filter(([p, v]) => p.startsWith("_history/") && typeof v === "string")
    .map(([, v]) => v);
  t("the prior revision is IN the record, as bytes and not as a summary of them", snaps.length >= 1, true);
  t("and it still carries the hunch WITH ITS AUTHOR AND ITS DATE — nothing silently vanishes",
    [snaps.some((s) => /grade_source: hunch/.test(s)),
     snaps.some((s) => /author: casey/.test(s)),
     snaps.some((s) => /date: 2026-08-03/.test(s))], [true, true, true]);
  t("while the CURRENT bytes carry neither, because the debt really was settled",
    [/grade_source: hunch/.test(img.image?.["bundle.md"] ?? ""),
     /author: casey/.test(img.image?.["bundle.md"] ?? "")], [false, false]);
}

/* ============================ 5. THE CAPTURE AXIS ====================== */

console.log("\n--- 5. the capture axis is EARNED from the capture record, never authored ---");
{
  const capLeg = (id, target, grade, source, extra = {}) => promote(id, inquiryMd(id,
    { question: `Capture ${grade} for ${target}?`, subject: ORD, refs: [target],
      legs: [{ target, role: "supports", grade, axis: "capture", source, ...extra }] }), "inquiry");

  const okB = await capLeg("INQ-2026-1800-cap-b", DOC_A, "B", "capture");
  t("THE ITEM: a leg's capture grade comes from the capture record, and B lands",
    okB.ok !== false, true);
  const capRow = await legOf("INQ-2026-1800-cap-b", DOC_A);
  t("and it reads back with the source that accounts for it, on its own axis",
    [capRow?.grade ?? null, capRow?.grade_source ?? null], ["B", "capture"]);

  const capA = await capLeg("INQ-2026-1800-cap-a", DOC_A, "A", "capture");
  t("grade A on the capture axis is UNREACHABLE — it needs a chain-of-custody archive this plane cannot produce",
    [capA.ok, /STRONGER than the B the record can earn/.test(details(capA))], [false, true]);

  const bare = await capLeg("INQ-2026-1800-cap-bare", DOC_BARE, "B", "capture");
  t("a document the record holds no bytes for earns NOTHING: there is nothing for the grade to measure",
    [bare.ok, /no registered capture/.test(details(bare))], [false, true]);

  /* NEVER AUTHORED, and this is the arm that makes those words mean something.
     A capture grade states how the BYTES REACHED US — a fact about this record's
     own machinery. Testimony is a member's account of a CONNECTION; a hunch is a
     member's provisional CONNECTION; neither can be an account of a fetch. */
  const byTestimony = await capLeg("INQ-2026-1800-cap-test", DOC_A, "D", "testimony");
  const byHunch = await capLeg("INQ-2026-1800-cap-hunch", DOC_A, "B", "hunch",
    { author: "casey", date: "2026-08-04" });
  t("the capture axis refuses a MEMBER as its source — testimony and hunches are connection acts",
    [byTestimony.ok, byHunch.ok], [false, false]);
  t("and it says why, in the words a member reads: a grade about a fetch is not theirs to assert",
    [/not one a member can assert/.test(details(byTestimony)),
     /not one a member can assert/.test(details(byHunch))], [true, true]);

  const byResolution = await capLeg("INQ-2026-1800-cap-res", DOC_A, "B", "resolution");
  t("and it refuses `resolution` too: a resolution IS the §8.1 CONNECTION grade and grades nothing else",
    [byResolution.ok, /can only be a source for a connection grade/.test(details(byResolution))],
    [false, true]);
}

/* ============================ 6. ONE RULE, TWO GATES, ONE READ ========= */

console.log("\n--- 6. one rule at both gates, and a read that cannot drift from it ---");
{
  /* THE PURE CHECKER cannot see `resolutions` or the capture record, so it
     REFUSES a leg claiming an earned grade rather than waving it through —
     checkInheritedLeg's posture exactly, and for the same reason: a blinded gate
     that passes is worse than one that says it is blind. */
  const md = inquiryMd("INQ-2026-1800-both", { question: "Both gates?", subject: ORD,
    refs: [DOC_A], legs: [{ target: DOC_A, role: "supports", grade: "A",
                            axis: "connection", source: "resolution" }] });
  t("the catalog with NO registry refuses the leg rather than passing it — a blind gate says so",
    await errorsOf("INQ-2026-1800-both", md), ["C-2.8"]);
  const reg = await get("earnedbasis", `id=${CASE}&targets=${DOC_A}`);
  t("and the SAME bytes pass once the record is injected — one function, one answer, two callers",
    await errorsOf("INQ-2026-1800-both", md, reg), []);

  /* THE READ AND THE REFUSAL COME FROM ONE FUNCTION. This is what keeps the
     write path from being a gate that pressures a member into guessing: what
     op=earnedbasis reports is what op=promote will accept, and the assertion is
     over the VALUE rather than over the source text. */
  const wrong = await promote("INQ-2026-1800-drift", inquiryMd("INQ-2026-1800-drift",
    { question: "Drift?", subject: ORD, refs: [DOC_A],
      legs: [{ target: DOC_A, role: "supports", grade: "B", axis: "connection",
               source: "resolution" }] }), "inquiry");
  t("a grade the READ does not report is a grade the WRITE does not accept",
    [reg.earned.connection[DOC_A].grade, wrong.ok], ["A", false]);
  t("and the refusal points at the read by name, so the correction is one call away",
    /op=earnedbasis/.test(JSON.stringify(wrong.findings ?? [])), true);

  /* THE GATED READ, on op=inquirystrength's posture: an inquiry the viewer may
     not see is withheld as an ABSENT one, byte-identically. */
  const absent = await get("earnedbasis", "id=INQ-2026-1800-never-existed");
  const notMine = await get("earnedbasis", `id=${CASE}`, "prb-r18");
  t("a read for a bundle that does not exist and one for a bundle a viewer may not see are the same answer",
    absent.reason, "NO_SUCH_BUNDLE");
  t("the probe class reaches the op at all (it is a member-class read, not an admin one)",
    notMine.ok !== undefined, true);
  const notInquiry = await get("earnedbasis", `id=${DOC_A}`);
  t("asking it about a DOCUMENT is refused by name: only an inquiry has a basis",
    [notInquiry.ok, notInquiry.reason], [false, "NOT_AN_INQUIRY"]);
  t("op=earnedbasis with no id refuses rather than answering about everything",
    (await get("earnedbasis")).reason, "NO_ID");
}

console.log(`\nearnedbasis: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
