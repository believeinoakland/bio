/* NEGATIVE CONTROL: RUN 2026-09-17 by the REC-119 worker — FIVE arms plus a baseline, each armed ALONE, every arm restored from its OWN uniquely-named pristine copy and every restore verified byte-identical by sha256 AND by size against a 500 kB floor (store.mjs 2,316,766 bytes; 0 copies left in the tree). ONE COMMAND EACH: `node test/nc-rec119.mjs <none|a|b|c|d|e>` from `bio-plane/` — the driver holds every patch, its DECLARATION and the declared-vs-actual check. BASELINE ARM `none` = 24 pass / 0 fail / exit 0. (a) THE ITEM'S OWN — the registry is still asked and its answer DISCARDED, so both ops publish the AUTHORED letter again -> 18 pass, 6 FAIL, AS DECLARED, and **THE HEADLINE NAMES BOTH LETTERS, BOTH OPS, THE TARGET AND THE AXIS**, which the row requires because a failure naming one is one a reader cannot act on: `want {"op":"op=basisversions","sibling_op":"op=suggest","target":"INFO-2026-9901-transcribed","grade_earned_published":"C","grade_authored_published":"B","axis":"capture"} got {…"grade_earned_published":"B","grade_authored_published":"B"…}`. (c) THE MEMBER'S ACT ERASED — the letter caps correctly but `grade_authored`/`grade_why` are not published, which is the OTHER defensible answer implemented -> 15 pass, 9 FAIL, AS DECLARED; the `got` shows `grade_earned_published: "C"`, so **capping alone does not satisfy this suite and the compromise is load-bearing rather than decorative**. (d) THE AXIS IGNORED -> 22 pass, 2 FAIL, AS DECLARED — the connection leg moves from A to C. (e) OVER-STRICTNESS — the same rule as an explicit `for` loop -> 24 pass, 0 fail, exit 0: correct work in an unanticipated spelling PASSES. **(b) IS THE ARM THIS ITEM EXISTS TO PROTECT AND IT IS THE ONLY TWO-PHASE ONE: THE FROZEN BYTES CAPPED TOO.** It cannot be driven in-process, and that is the finding rather than an inconvenience — **a builder that caps is SELF-CONSISTENT under one code version**, writing and re-computing the same capped bytes, so `prior.composition === v.composition` holds and the freeze is SILENT. The damage exists only ACROSS the change. So the arm runs TWO PROCESSES over ONE PERSISTED STORE (`defaultPersistRoot`): phase A writes the version under PRISTINE code (`composition_leg_letter: "B"`), the driver then arms the patch, and phase B re-promotes THE IDENTICAL DOCUMENT under PATCHED code -> **REFUSED `VERSION_FROZEN`, `changed: "leg changed"`, AS DECLARED. An old case became UNRATIFIABLE, and it is invisible to every assertion about `legs[]`.** **TWO FINDINGS ABOUT THE ARMS THEMSELVES, KEPT AT THE ARM IN THE DRIVER RATHER THAN SMOOTHED.** First: **every read-side arm's FIRST spelling anchored TWICE and the driver REFUSED to run it** (`anchor occurs 2 time(s)`, exit 4) — this resolver's body is BYTE-IDENTICAL to REC-114's `#legEarnedCapture`, which is exactly what makes the four readers one rule, so **the reuse that is this lineage's doctrine is what makes a body-only anchor ambiguous**; a blind `String.replace` would have broken REC-114's resolver, run a suite that never touches it and reported a clean pass. REC-118 recorded this and it recurred in the same place, which is what a trap looks like when its instrument already exists. Every arm now anchors on the WHOLE METHOD, signature included. Second: **arm (b)'s first spelling armed the FILE and not the BEHAVIOUR** — it compared `<` where `#GRADE_RANK` is `BASIS_GRADES.length - i`, so a stronger letter carries a HIGHER number and capping is `>`; the patch applied on a unique anchor, phase B ran, and the stored letter came back UNCHANGED. The arm-that-did-not-arm class with the sign literally flipped, caught only because the driver prints what phase B actually STORED rather than only whether it was refused. **AND THE SUITE ITSELF WAS CORRECTED BY THE CONTROL RATHER THAN BY REVIEW: arm (d) first ran GREEN at 24/0** — the fixture carried two capture-axis legs and no connection leg, so a resolver that forgot the axis behaved identically and the suite could not see its own rule removed. The connection leg exists because the control said so. **THE WHOLE CONTROL IS DRIVEN ON A FIXTURE, NEVER ON THE LIVE INSTANCE, STATED BECAUSE IT IS A LIMIT AND NOT A CHOICE:** the live instance holds ZERO basis legs and `test/rec88-instance-census.mjs` measured ZERO captures carrying a transcription chain anywhere in store `bio` on 2026-09-15, so every live answer this item touches is byte-identical BY CONSTRUCTION and would pass every arm above without exercising one. REC-108, REC-114 and REC-118 all hit this and stated it; so does this.
 *
 * REC-119 / D-411 — THE SIXTH READER OF A CAPTURE-AXIS LETTER, AND THE FOURTH LOOP OVER ONE RULE.
 *
 * `#versionCollections` issued BYTE-FOR-BYTE the same SELECT, over the same table, with the same
 * LIMIT constant that `#versionLegsAsMembers` has routed through `earnedBasisRegistry` since
 * REC-88 — ~650 lines lower in the same file — and returned the rows WHOLE, asking the registry
 * nothing. Two readers of one column in one file, one capped and one not, feeding
 * `op=basisversions` and `op=suggest`.
 *
 * THE RULING IS INHERITED, NOT RE-LITIGATED. REC-105 capped the walk, REC-114 the leg listing,
 * REC-118 `op=reevaluations`. Publish what the record can SUPPORT, never erase what a member
 * AUTHORED, say why they differ. `Store.#capturedAt` is the one arithmetic and is READ, never
 * edited.
 *
 * WHAT IS THIS ITEM'S OWN, AND WHY IT WAS ROWED RATHER THAN SWEPT — THE FREEZE.
 * `inquiry_basis_versions.composition` EMBEDS THE AUTHORED LETTERS AS TEXT, is republished
 * verbatim by the same op, and is BYTE-COMPARED by PL-1's freeze at every promotion. So the
 * composition MUST keep its authored bytes and must NOT be capped, while `legs[]` must publish
 * what the record earns. Two halves of one answer, deliberately allowed to differ — and an answer
 * that did not SAY WHICH IS WHICH would be lying more precisely rather than less.
 *
 * CONDUCT #3 RULED IT AND BRIEFED ITS OWN FALSIFIER: if the label could not live OUTSIDE the
 * frozen string, the ruling was unimplementable and the item was BOB's. IT SURVIVED, and the
 * evidence is structural rather than argued — the freeze compares the STORED column against bytes
 * the canonical builder computed at the WRITE, this is a READ path, and a label already lives
 * outside those bytes: REC-75's `composition_of`, on this very op's sibling. Block 4 drives the
 * byte-identity rather than resting on that reasoning.
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *   1. THE FIXTURE IS REAL AND THE VERSION EXISTS, printed and FLOORED — asserted BEFORE anything
 *      about its contents, because a list filtered to empty passes every assertion about what is
 *      in it.
 *   2. `op=basisversions` PUBLISHES THE EARNED LETTER WITH THE AUTHORED ONE BESIDE IT, and the
 *      headline NAMES BOTH LETTERS AND BOTH OPS.
 *   3. `op=suggest` DOES THE SAME, THROUGH THE SAME ONE READER — and this is the SHARPEST form of
 *      the defect, sharper than `op=reevaluations`: the composition written IN THE SAME ACT holds
 *      the authored letter while `legs[]` carries the earned one, so one object, written once,
 *      gave two letters for one leg. **The version-leg write path does NOT apply C-2.8's ceiling
 *      refusal** — measured here, not assumed — so this overclaim can be AUTHORED FRESH today and
 *      is not merely inherited from a re-read, which is what makes this reader live rather than
 *      latent.
 *   4. THE COMPOSITION IS BYTE-UNCHANGED ACROSS THE ITEM, which the row calls the constraint most
 *      likely to be broken silently — driven by capturing the string BEFORE the re-read and
 *      comparing it AFTER, and by reading the authored letter out of the frozen text itself.
 *   5. THE FREEZE/RATIFY PATH STILL ACCEPTS A DOCUMENT AUTHORED BEFORE THE CHANGE.
 *   6. THE CAP IS A READ-TIME RESOLUTION AND THE TABLE IS UNTOUCHED — proved by reading the
 *      member's authored letter back through a SECOND SURFACE (`op=versionstrength`'s `graded[]`,
 *      which reads the same table through `#versionLegsAsMembers`) rather than trusting this op's
 *      own computed return. REC-117's finding: a return value can pass under a defect because it
 *      is computed rather than read back.
 *   7. OVER-STRICTNESS — a leg needing no cap is byte-identical but for the added fields, and a
 *      connection-axis leg is untouched, which is also the arm that catches the cheapest wrong
 *      answer: copying the strength block into the legs.
 *   8. SOURCE PINS — one arithmetic, one registry call, and the two ops read ONE reader.
 *
 * Everything runs against `src/index.mjs`'s real worker through miniflare, so a feature no caller
 * can reach fails here rather than passing at store level (D-43).
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r119", MEMBER_TOKEN: "mem-r119", PROBE_TOKEN: "prb-r119",
              AI_TOKEN: "ai-r119", VERSION: "test" },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r119") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r119") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

try {

/* ===================== THE FIXTURE =====================
   THE ORDER IS FORCED BY THE RECORD RATHER THAN CHOSEN, for `basis:` legs: REC-88's write-side
   refusal (C-2.8) means a leg at the byte ceiling on a document ALREADY transcribed weaker cannot
   be authored at all, so the route into "authored letter outruns the ceiling" is the one D-383
   describes — the document is CLEAN when the leg is written and is RE-READ afterwards.

   THIS SUITE USES THAT ORDER FOR THE PROMOTED VERSION **AND MEASURES THAT `op=suggest` DOES NOT
   NEED IT** (block 3). That difference is a fact about the write path, driven rather than assumed,
   and it is what makes this reader live rather than latent.

   TWO DOCUMENTS ON ONE VERSION, WHICH IS THE POINT:
     DOC   — transcribed by a machine after the leg was written, so the authored letter outruns the
             ceiling. The defect's own shape.
     DOC2  — publisher-typed text, no transcription chain, nothing to cap. The UNMOVED control: if
             this leg's letter moves, the fix is capping things it must not. */
const NOW = "2026-09-17T00:00:00Z", LATER = "2026-09-17T01:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`] : v === undefined ? []
  : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  if (!versions) return [];
  const rows = versions.map((v) => ["  - name: \"" + v.name + "\"",
    ...scalar("description", v.description), ...scalar("relationship", v.relationship),
    ...scalar("state", "suggested"), ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("author", "ruth"), ...scalar("at", NOW)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ["  - version: \"" + v.name + "\"", ...scalar("ground", g.ground),
     ...scalar("asserted_by", "ruth"), ...scalar("at", NOW),
     ...scalar("statement", g.statement)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ["  - version: \"" + v.name + "\"", ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", l.grade), ...scalar("grade_axis", l.grade_axis),
     ...scalar("grade_source", l.grade_source), ...scalar("date", NOW)].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const refLines = (t2) => t2.length
  ? ["references:", ...t2.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const inquiryMd = (id, { subject = null, refs = [], versions = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []), ...versionLines(versions),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0; const HEAD = new Map();
const promote = async (id, text, type, { register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) { const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }); }
  const r = await post("promote", { bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260917T${String(700000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files, register });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 900)}`);
  HEAD.set(id, r.bundleSha); return r;
};

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24681"] });
const ORD = eOrd.entity_id;
const ENT = [{ ref: "ordinance:24681", kind: "ordinance", key: "24681", label: "Ordinance No. 24681" }];
const readingOf = (s, chain) => ({ capture: { sha256: s, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
             entities: ENT, facts: {}, ...(chain === undefined ? {} : { text_source: chain }) } });
/* The `cap` on the ocr step IS what makes the ceiling come out below the byte ceiling. A reading
   with no `text_source` at all is untranscribed and nothing caps it — that is DOC2. */
const OCR_CHAIN = [{ step: "pixels" },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];

const DOC = "INFO-2026-9901-transcribed", DOC2 = "INFO-2026-9902-typed",
      INQ = "INQ-2026-9901-versions";
const S1 = sha("rec119-a"), S2 = sha("rec119-b");
const VNAME = "reading-one";

for (const [doc, s] of [[DOC, S1], [DOC2, S2]]) {
  await promote(doc, infoMd(doc), "information",
    { reading: readingOf(s, undefined),
      register: [{ path: "snapshots/r.bin", sha256: s, encoding: "binary", bytes: 10 }] });
  await post("resolve", { captureSha: s });
}
/* THE VERSION IS DEFINED ONCE AND PROMOTED TWICE — here, and again in block 5's freeze arm.
   ONE DEFINITION IS THE POINT: block 5 asks whether an UNCHANGED document still ratifies, and a
   second hand-written copy of this list is a second thing that can drift from it. Driven out by
   hitting it — the first spelling re-promoted a two-leg copy after this one had grown a third
   leg, and the freeze correctly refused with `a leg was removed`. That read as this arm failing
   while the freeze was doing exactly its job, which is the same shape as block 5's CAS note: an
   arm that cannot tell its subject's refusal from its own fixture's mistake reports the wrong
   finding confidently. */
const VERSIONS = [
  { name: VNAME, description: "The ledger and the minutes together evidence the transfer.",
    relationship: "and",
    grounds: [{ ground: "paper trail", statement: "The ledger and minutes read together." }],
    legs: [
      { target: DOC, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
      { target: DOC2, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
      /* THE CONNECTION LEG, ON THE SAME DOCUMENT THE CAPTURE CEILING BINDS — and it is here
         because the negative control SAID SO rather than because it was designed in. Arm (d),
         which ignores the axis, did NOT FIRE on the first fixture: both legs were on the capture
         axis, so a resolver that forgot the axis behaved identically and the suite stayed GREEN
         with its own rule removed. That is a hole a passing suite cannot show you, and it is the
         whole reason the control is run rather than reasoned about. With this leg present, a
         resolver that drops the axis condition reaches for a CAPTURE ceiling on a CONNECTION leg
         and moves a letter nobody asked to bound. */
      { target: DOC, ground: "paper trail", grade: "A", grade_axis: "connection",
        grade_source: "testimony" },
    ] }];
await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC, DOC2], versions: VERSIONS }), "inquiry");

/* THE COMPOSITION AS THE RECORD FROZE IT, CAPTURED BEFORE ANYTHING IS RE-READ. Block 4 compares
   against this, which is what makes the byte-identity a MEASUREMENT rather than a restatement of
   the code's intent. */
const beforeAnswer = await get("basisversions", `id=${INQ}`);
const COMP_BEFORE = beforeAnswer.versions?.[0]?.composition ?? null;

/* THE RE-READ. The document's text is now machine-derived and measured weaker, so the ceiling is
   below the letter the member already authored. The record is append-only: the authored letter
   survives its own document being re-read weaker. */
await promote(DOC, infoMd(DOC), "information",
  { reading: readingOf(S1, OCR_CHAIN),
    register: [{ path: "snapshots/r.bin", sha256: S1, encoding: "binary", bytes: 10 }] });

const answer = await get("basisversions", `id=${INQ}`);
const V = (answer.versions ?? []).find((v) => v.name === VNAME) || null;
const legOf = (v, target) => ((v && v.legs) || []).find((l) => l.target_id === target) || null;
const MOVED = legOf(V, DOC), CLEAN = legOf(V, DOC2);
const CONN = ((V && V.legs) || []).find((l) => l.grade_axis === "connection") || null;

console.log("\n--- 1. THE FIXTURE IS REAL, AND IT IS FLOORED BEFORE ANYTHING IS ASSERTED ABOUT IT ---");
{
  console.log(`  op=basisversions: ${(answer.versions ?? []).length} version(s), ` +
              `${((V && V.legs) || []).length} leg(s) on '${VNAME}'`);
  /* A list filtered to empty passes every assertion about what is in it, so the floor comes
     first and the two legs are named individually rather than counted. */
  t("the version was RECORDED and reads back with ALL THREE legs — the ceremony REC-114's fixture does not perform, performed here",
    { ok: answer.ok, total: answer.total, version_present: !!V,
      legs: ((V && V.legs) || []).length, moved_present: !!MOVED, clean_present: !!CLEAN,
      connection_present: !!CONN },
    { ok: true, total: 1, version_present: true, legs: 3, moved_present: true, clean_present: true,
      connection_present: true });
}

console.log("\n--- 2. op=basisversions — THE EARNED LETTER, WITH THE AUTHORED ONE BESIDE IT ---");
{
  /* THE HEADLINE NAMES BOTH LETTERS AND BOTH OPS. A failure naming one is one a reader cannot
     act on, and this item's whole subject is two letters for one leg. */
  t("D-411 CLOSED at op=basisversions: the leg publishes what the record can SUPPORT, with what the member AUTHORED beside it — and op=suggest reads the SAME one reader",
    { op: "op=basisversions", sibling_op: "op=suggest", target: MOVED && MOVED.target_id,
      grade_earned_published: MOVED && MOVED.grade,
      grade_authored_published: MOVED && MOVED.grade_authored,
      axis: MOVED && MOVED.grade_axis },
    { op: "op=basisversions", sibling_op: "op=suggest", target: DOC,
      grade_earned_published: "C", grade_authored_published: "B", axis: "capture" });
  /* The sentence is the record's own and is not composed here — it comes from
     `earnedBasisRegistry` through `Store.#capturedAt`. Asserted by SUBSTANCE rather than
     verbatim, so a wording improvement is not a test failure while a silent emptying is. */
  t("`grade_why` NAMES BOTH LETTERS AND THE TARGET, so a member is told why the two differ rather than left to diff them",
    { has: typeof (MOVED && MOVED.grade_why) === "string",
      names_target: !!(MOVED && MOVED.grade_why || "").includes(DOC),
      names_earned: !!(MOVED && MOVED.grade_why || "").includes("no more than C"),
      names_authored: !!(MOVED && MOVED.grade_why || "").includes("not at the B it carries") },
    { has: true, names_target: true, names_earned: true, names_authored: true });
  t("BOTH derived fields are ALWAYS present — a field that appears only on disagreement is a one-bit signal of exactly that, and forces a consumer to read absence as a value",
    { moved: ["grade", "grade_authored", "grade_why"].every((k) => MOVED && k in MOVED),
      clean: ["grade", "grade_authored", "grade_why"].every((k) => CLEAN && k in CLEAN) },
    { moved: true, clean: true });
}

console.log("\n--- 3. op=suggest — THE SAME READER, AND THE SHARPEST FORM OF THE DEFECT ---");
{
  const opened = await post("airunopen", {
    run: "RUN-2026-9901-rec119", contextType: "inquiry", contextId: INQ,
    label: "REC-119 fixture — the run the suggestion names", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened).slice(0, 400)}`);

  /* THE LEG IS AUTHORED ABOVE THE CEILING **ON A DOCUMENT THAT IS ALREADY TRANSCRIBED**, and it
     is ACCEPTED. That is measured here rather than assumed, and it is the finding that makes this
     reader live rather than latent: the version-leg write path does not apply C-2.8's ceiling
     refusal the way the `basis:` path does, so this overclaim can be AUTHORED FRESH today. */
  const sug = await post("suggest", {
    target: INQ, run: "RUN-2026-9901-rec119", kind: "basis-version",
    name: "a second reading", relationship: "and",
    description: "The ledger's own figures carry the transfer without the minutes, so this reading "
      + "drops the minutes and rests on the ledger alone.",
    grounds: [{ ground: "paper trail", statement: "The ledger is read on its own terms here." }],
    legs: [{ target: DOC, role: "supports", ground: "paper trail",
             grade: "B", grade_axis: "capture", grade_source: "capture" }] });
  const sLeg = ((sug && sug.legs) || [])[0] || null;
  console.log(`  op=suggest: ok=${sug && sug.ok}, ${((sug && sug.legs) || []).length} leg(s)`);

  t("the write is ACCEPTED and the suggestion is in the record — floored before anything is asserted about what it published",
    { ok: sug && sug.ok, wrote: sug && sug.wrote, read_back: sug && sug.read_back,
      legs: ((sug && sug.legs) || []).length },
    { ok: true, wrote: true, read_back: true, legs: 1 });
  t("D-411 CLOSED at op=suggest TOO, through the SAME `#versionCollections` — one reader, two consumers, so the two ops cannot come to disagree about one version",
    { op: "op=suggest", grade_earned_published: sLeg && sLeg.grade,
      grade_authored_published: sLeg && sLeg.grade_authored,
      why_names_both: !!(sLeg && sLeg.grade_why || "").includes("not at the B it carries") },
    { op: "op=suggest", grade_earned_published: "C", grade_authored_published: "B",
      why_names_both: true });
  /* THE SHARPEST FORM, AND WHY THIS OP MATTERS MORE THAN THE FIFTH READER'S. The composition was
     written by THIS ACT, moments ago, and it holds the AUTHORED letter — while `legs[]` on the
     SAME answer carries the earned one. One object, written once, two letters for one leg. That
     is not a defect to remove: PL-1 compares those bytes. It is a divergence to LABEL. */
  t("THE TWO HALVES OF ONE ANSWER DIFFER, IN AN OBJECT WRITTEN BY THIS VERY ACT — and the envelope SAYS WHICH IS WHICH rather than leaving a reader to diff them",
    { composition_holds_authored: typeof (sug && sug.composition) === "string"
        && sug.composition.includes(`\tsupports\tB\tcapture\tcapture`),
      composition_holds_earned: typeof (sug && sug.composition) === "string"
        && sug.composition.includes(`\tsupports\tC\tcapture\tcapture`),
      legs_publish_earned: sLeg && sLeg.grade,
      label: sug && sug.composition_grades,
      label_is_grouped_as_a_label: sug && sug.fields_of && sug.fields_of.composition_grades },
    { composition_holds_authored: true, composition_holds_earned: false,
      legs_publish_earned: "C", label: "authored", label_is_grouped_as_a_label: "label" });
}

console.log("\n--- 4. THE COMPOSITION IS BYTE-UNCHANGED — THE CONSTRAINT MOST LIKELY TO BREAK SILENTLY ---");
{
  const COMP_AFTER = V && V.composition;
  /* MEASURED ACROSS THE RE-READ rather than argued from the read path's shape. The string is the
     one PL-1 compares byte for byte, so this is the arm standing between this item and an
     unratifiable old case. */
  t("the frozen composition is BYTE-IDENTICAL before and after the document was re-read weaker — PL-1's comparison sees exactly what it saw",
    { captured_before: typeof COMP_BEFORE === "string" && COMP_BEFORE.length > 0,
      identical: COMP_BEFORE === COMP_AFTER },
    { captured_before: true, identical: true });
  t("...and it still holds the AUTHORED letter for the leg the READ now caps — the two halves differ ON PURPOSE, which is the whole of this item's design question",
    { holds_authored: typeof COMP_AFTER === "string"
        && COMP_AFTER.includes(`leg\t0\t${DOC}\tinformation\tsupports\tB\tcapture\tcapture`),
      holds_earned: typeof COMP_AFTER === "string"
        && COMP_AFTER.includes(`leg\t0\t${DOC}\tinformation\tsupports\tC\tcapture\tcapture`),
      legs_publish: MOVED && MOVED.grade },
    { holds_authored: true, holds_earned: false, legs_publish: "C" });
  t("THE ENVELOPE SAYS WHICH IS WHICH: the frozen half is LABELLED as authored, so a consumer diffing composition against legs learns the two answer different questions rather than that the record contradicts itself",
    { label: V && V.composition_grades, composition_present: typeof COMP_AFTER === "string" },
    { label: "authored", composition_present: true });
}

console.log("\n--- 5. THE FREEZE STILL ACCEPTS A DOCUMENT AUTHORED BEFORE THE CHANGE ---");
{
  /* THE ACCEPTANCE CLAUSE, DRIVEN. A fix that quietly capped the frozen bytes would pass every
     assertion about `legs[]` above and make an old case UNRATIFIABLE — the failure this item
     exists to avoid, and the one nothing else here would catch. */
  /* THE CAS BASE IS RE-READ FIRST, AND THAT IS NOT BOOKKEEPING — IT IS WHAT MAKES THIS ARM
     MEASURE ITS SUBJECT. Block 3's `op=suggest` wrote to this same inquiry, so the sha this
     fixture last held is stale. Re-promoting on it answers `CAS_STALE` (C-33.21), which is a
     DIFFERENT refusal from the freeze's `VERSION_FROZEN` and would have read as this arm failing
     while the freeze was never consulted at all. Driven out by hitting it: the first run of this
     suite failed here with `CAS_STALE`, and an arm that cannot tell the two refusals apart is one
     that reports the wrong finding confidently. */
  const listed = await get("list", "limit=1000");
  const live = ((listed && listed.bundles) || []).find((b) => b.bundle_id === INQ);
  HEAD.set(INQ, live ? live.bundle_sha : HEAD.get(INQ));
  let refused = null, ok = null;
  try {
    const again = await promote(INQ,
      inquiryMd(INQ, { subject: ORD, refs: [DOC, DOC2], versions: VERSIONS }), "inquiry");
    ok = again.ok !== false;
  } catch (e) { refused = String(e).slice(0, 300); }
  t("a version authored BEFORE this change re-promotes unchanged and the freeze does NOT refuse it — the old case is still ratifiable",
    { promoted: ok, refusal: refused }, { promoted: true, refusal: null });
}

console.log("\n--- 6. THE CAP IS READ-TIME — THE TABLE IS UNTOUCHED, READ BACK THROUGH A SECOND SURFACE ---");
{
  /* REC-117's FINDING APPLIED: a return value can pass under a defect because it is COMPUTED
     rather than read back. `op=versionstrength` reads the SAME `inquiry_basis_version_legs` rows
     through `#versionLegsAsMembers` — a different method, a different op — and publishes the
     member's authored letter as `authored`. If the cap had been written into the table, this
     surface would report the capped letter as the authored one. */
  const vs = await get("versionstrength", `id=${INQ}&version=${VNAME}&states=suggested`);
  const g = ((vs && vs.graded) || []).find((x) => x.target_id === DOC) || null;
  t("a SECOND surface reads the member's AUTHORED letter straight back off the same table — so the cap is applied on the way OUT and `inquiry_basis_version_legs` was never written to",
    { op: "op=versionstrength", authored_read_back: g && g.authored, earned_here: g && g.grade,
      and_basisversions_agrees: MOVED && MOVED.grade_authored },
    { op: "op=versionstrength", authored_read_back: "B", earned_here: "C",
      and_basisversions_agrees: "B" });
}

console.log("\n--- 7. OVER-STRICTNESS — NOTHING IS CAPPED THAT MUST NOT BE ---");
{
  /* The whole point of the CLEAN document: a leg at or under its ceiling must come back exactly
     as it did, but for the two added fields. An item that capped everything would pass block 2
     and fail here. */
  /* CORRECTED BY D-709 (BOB #35, 2026-09-25 10:05Z), never exempted: this pinned
     `grade_why` NULL on the uncapped leg, and that pin encoded a SILENCE — the
     document has no recorded fetch route, and a null reason cannot be told from
     "the route was measured". Nothing is capped still (the letter stands); the
     reason now states the letter is the author's, under the ceiling, unmeasured. */
  const AUTHORED_UNDER_CEILING = /^this leg is read here at its author's own B, not over B: the record does not say where .* came from, so that grade has not been checked\.$/;
  t("A LEG NEEDING NO CAP IS BYTE-IDENTICAL BUT FOR THE ADDED FIELDS — publisher-typed text earns its letter and keeps it",
    { target: CLEAN && CLEAN.target_id, grade: CLEAN && CLEAN.grade,
      authored: CLEAN && CLEAN.grade_authored, why: !!CLEAN && AUTHORED_UNDER_CEILING.test(CLEAN.grade_why ?? ""),
      axis: CLEAN && CLEAN.grade_axis, role: CLEAN && CLEAN.role, ord: CLEAN && CLEAN.ord },
    { target: DOC2, grade: "B", authored: "B", why: true, axis: "capture", role: "supports", ord: 1 });
  t("`grade_why` STATES the letter is the author's under the ceiling, never measured, when nothing was capped and no route is recorded (D-709)",
    !!CLEAN && AUTHORED_UNDER_CEILING.test(CLEAN.grade_why ?? ""), true);
  /* THE REST OF THE LEG IS UNMOVED. A fix that rebuilt the leg object rather than resolving one
     field on it would drop `note`, `at` or `ground` and no arm above would notice. */
  t("the rest of the leg object is UNMOVED — this item resolves ONE field and rebuilds nothing, so `note`, `at` and `ground` still travel",
    { keys: Object.keys(MOVED || {}).sort().join(","), ground: MOVED && MOVED.ground,
      at: MOVED && MOVED.at, target_type: MOVED && MOVED.target_type },
    /* CORRECTED 2026-09-18 BY REC-86 (IC-123, closing D-350), NOT EXEMPTED: the leg
       now also carries `content_id` — which part it rests on — selected in the SAME
       statement and resolved by nothing, so "rebuilds nothing" still holds exactly. */
    { keys: "at,content_id,grade,grade_authored,grade_axis,grade_source,grade_why,ground,note,ord,role,"
        + "target_id,target_type",
      ground: "paper trail", at: NOW, target_type: "information" });
  /* THE ARM THE NEGATIVE CONTROL DEMANDED. A CONNECTION-axis leg on the SAME document whose
     CAPTURE ceiling binds: the capture ceiling is not a general grade cap, and a resolver that
     forgot the axis would reach for that ceiling and move this letter. Without this arm, control
     arm (d) — the axis ignored — ran GREEN at 22/0 and the suite could not see its own rule being
     removed. It is also the arm that catches the cheapest wrong answer to this item: making the
     two halves "agree" by copying one letter across every leg. */
  t("A CONNECTION-AXIS LEG ON THE SAME DOCUMENT IS UNTOUCHED — the capture ceiling bounds the capture axis and is not a general grade cap",
    { target: CONN && CONN.target_id, axis: CONN && CONN.grade_axis, grade: CONN && CONN.grade,
      authored: CONN && CONN.grade_authored, why: CONN && CONN.grade_why },
    { target: DOC, axis: "connection", grade: "A", authored: "A", why: null });
  t("...and that is NOT FREE: the SAME document is bounded at C on the capture axis, so a resolver that dropped the axis condition would have moved this leg and this arm would fire",
    { same_document: (CONN && CONN.target_id) === (MOVED && MOVED.target_id),
      capture_leg_was_capped: MOVED && MOVED.grade, connection_leg_held: CONN && CONN.grade },
    { same_document: true, capture_leg_was_capped: "C", connection_leg_held: "A" });
  t("the version's OTHER published facts are untouched — the bound, the record's own count and the completeness flag still answer as they did",
    { leg_count: V && V.leg_count, legs_complete: V && V.legs_complete,
      grounds: V && V.grounds, state: V && V.state, relationship: V && V.relationship },
    { leg_count: 3, legs_complete: true, grounds: ["paper trail"], state: "suggested",
      relationship: "and" });
}

console.log("\n--- 8. SOURCE PINS — ONE ARITHMETIC, ONE REGISTRY CALL, ONE READER ---");
{
  const m = /#versionLegsEarned\(rows\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "";
  t("the resolver EXISTS and calls `Store.#capturedAt` — REC-105's arithmetic, reused rather than restated",
    { found: m.length > 0, calls_capturedAt: /Store\.#capturedAt\(/.test(m) },
    { found: true, calls_capturedAt: true });
  t("it mints NO letter of its own anywhere in its body",
    /["']\s*[ABCD]\s*["']/.test(m), false);
  t("it asks the registry ONCE for the whole version rather than once per leg — a per-row probe on a member-facing read",
    (m.match(/earnedBasisRegistry\(/g) || []).length, 1);
  t("it does NOT reach for `strengthOf` — the leg letter comes from the registry, never copied out of the envelope's other half",
    /strengthOf\(/.test(m), false);
  /* THE TWO OPS READ ONE READER, which is D-235's whole argument and is what makes block 3's
     agreement structural rather than a coincidence of two implementations. */
  const vc = /#versionCollections\(bundleId, row\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "";
  t("BOTH consumers go through the ONE collection reader, and that reader is where the resolution happens — so neither op can be fixed without the other",
    { resolver_called_in_collections: /#versionLegsEarned\(/.test(vc),
      basisversions_reads_it: /#versionCollections\(inq, r\)/.test(STORE_SRC),
      suggest_reads_it: /#versionCollections\(target, recorded\)/.test(STORE_SRC) },
    { resolver_called_in_collections: true, basisversions_reads_it: true, suggest_reads_it: true });
  /* THE FREEZE IS NOT TOUCHED BY THIS ITEM, pinned at the source, because the whole ruling rests
     on those bytes not moving. */
  t("the composition BUILDER and the FREEZE COMPARISON are untouched — the ruling rests on those bytes not moving, so an edit to either would be a defect in this item",
    { builder_emits_authored_leg_line: /\.\.\.legs\.map\(\(l, k\) => `leg\\t\$\{k\}/.test(STORE_SRC),
      freeze_compares_stored_column: /prior\.composition === v\.composition/.test(STORE_SRC) },
    { builder_emits_authored_leg_line: true, freeze_compares_stored_column: true });
}

} catch (e) {
  console.log(`  FAIL  the suite threw before it finished: ${e && e.stack ? e.stack : e}`);
  fail++;
} finally {
  await mf.dispose();
  console.log(`\nrec119-version-legs-earned: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
