/* NEGATIVE CONTROL: RUN 2026-09-18 with `node test/nc-mk2.mjs [arm]` from `bio-plane/`, every arm ALONE with the others held open, each EDITING A REAL SOURCE and restored from a uniquely-named per-arm pristine copy verified by sha256 AND by content (store.mjs 2,474,751 B sha256 0c90be297114…, bio-checks.mjs 768,844 B 39a5c5be4e53…; every restore byte-identical; never `git checkout --`). Declared BEFORE arming, and the result: (a) `baseline` — nothing armed, MUST be green: 51/0. (b) `cap` — THE ROW'S FIRST ARM, the testimony cap removed at every layer (the write's letter check, the write's registry comparison, the read cap): "ANY testimony grade other than D", "nothing was written … to grade above D" (it reads B) and the replay arm MUST FAIL — 47/4. (c) `capwrite` — the write's two layers alone: MUST FAIL the refusal, "nothing was written" (it now reads D through the read cap) and the attested-C refusal — 48/3. (d) `capread` — the read cap alone: the REPLAYED testimony B MUST FAIL (read at B) — 50/1. (e) `attest` — THE ROW'S SECOND ARM, a second member's agreement allowed to raise it (the registry lifts the letter once another leg rests on the observation; no op lets a member co-sign another's observation — op=attesttext refuses it NO_READING, so the forbidden rule is armed where it would have to live): "AFTER sam's attestation … still D", "the same leg at D is accepted" and "TWO WITNESSES" MUST FAIL — 31/14. (f) `liar` — THE ROW'S THIRD ARM, the capture axis reused with a label in the arithmetic (a testimony leg counted in the capture population): "THE LIAR REFUSED IN THE ARITHMETIC" MUST FAIL — 50/1; ITS FIRST DECLARATION ALSO NAMED "capture is NOT dragged to D" AND THAT STAYED GREEN — the finding: MK-1's CAPTURE_AXIS_AUTHORED null bound caps the smuggled leg to nothing on capture, a second defence. (g) `liarfull` — the liar with that bound removed too: both MUST FAIL — 23/22. (h) `liarwrite` — the liar at the write, the named capture-grade refusal removed: MUST FAIL — 49/2. (i) `notauthored` — testimony admitted on a document that is not an observation: MUST FAIL — 50/1. (j) `unfrozen` — the case freezes only capture and connection: the three-axis answer and the three frozen rows MUST FAIL — 48/3. (k) `pair2` — the case-member predicate back to `length === 2`: the three-row member stops being a case member and the malformed-block refusals go SILENT — MUST FAIL, 48/3; ITS FIRST DECLARATION NAMED "testimony row REMOVED" and was wrong about the subject (a two-row member is still admitted). (l) `overstrict` — THE OVER-STRICTNESS DIRECTION, the capture-grade refusal applied to every document: the ordinary capture leg and THE OVER-STRICTNESS PIN MUST FAIL — 31/14; ITS FIRST DRAFT applied the READ cap to capture and stayed green 51/0 — an arm that armed and could not be honoured (a capture leg takes the capture bound's branch first). (m) `overconn` — a connection-axis grade on an observation refused, which §7 does not list: MUST FAIL — 50/1. (n) `preitem` — A MEASUREMENT: `test/mk2-pristine-probe.mjs` over this tree and over `git archive f426f519` (the source MK-2 was built on), testimony keys removed: six inquiries, earnedbasis over two documents and one published case's answer and frozen bytes — BYTE-IDENTICAL, 13,400 B each. EVERY ARM AS DECLARED on the final run. RE-RUN 2026-09-18 by the RESUMED MK-2 worker after merging onto origin/main 27ad8b4f (MK-4, REC-130 between): every arm again AS DECLARED with the SAME tallies — baseline 51/0, cap 47/4, capwrite 48/3, capread 50/1, attest 31/14, liar 50/1, liarfull 23/22, liarwrite 49/2, notauthored 50/1, unfrozen 48/3, pair2 48/3, overstrict 31/14, overconn 50/1 (overconn now pins BOB #15's RULING in MEMBER-KNOWLEDGE-DESIGN.md §3, not a provisional); every restore byte-identical (store.mjs 2,503,407 B 63547c19128c…, bio-checks.mjs 776,690 B 8c0b71d7adf8…, and a sha256 -c over both after the whole run: OK); `preitem` re-based to 27ad8b4f (the harness's BASE — against f426f519 it would have charged MK-4's and REC-130's changes to this item) — BYTE-IDENTICAL, 13,400 B each.
 *
 * MK-2 / D-184 / IC-142 — THE `testimony` GRADE AXIS: a third axis at D
 * (`docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §3, §7).
 *
 * WHY AN AXIS AND NOT A LABEL. DEC-21's amendment defines the capture axis as
 * the act of READING A DOCUMENT IN. A member's authored observation was not read
 * in from anywhere — its bytes are the member's own words (MK-1, op=testify) —
 * so grading it "capture D" would make one axis mean two things. The liar this
 * suite exists to refuse is exactly that: the capture axis reused with a label.
 *
 * WHAT THIS SUITE DRIVES, every half THROUGH THE OPS against the real plane in
 * miniflare under SIGNED-IN members, except the pure-catalogue arms in §6, which
 * judge documents no op can produce yet (a published case resting on testimony —
 * MK-1's publication fence refuses one until MK-3):
 *
 *   1. THE REGISTRY (op=earnedbasis): an observation earns testimony D, value
 *      mode, from the register's `authored` flag; its capture axis earns no
 *      letter; an ordinary document earns no testimony entry at all.
 *   2. THE WRITE (op=promote), each §7 refusal that falls to MK-2 BY NAME — the
 *      C-2.8 finding's code: any capture grade on an observation
 *      (`testimony-leg-capture-graded`), any testimony grade other than D
 *      (`testimony-grade-not-d`), testimony on a document that is not an
 *      observation (`testimony-axis-not-authored`), a testimony grade with some
 *      other source (`testimony-axis-source`), a testimony grade on an inquiry
 *      leg (`testimony-axis-no-referent`).
 *   3. A SECOND MEMBER DOES NOT RAISE IT: sam attests ruth's observation's text
 *      and the testimony axis stays D in the registry, at the write and in the
 *      derived strength; sam's own identical observation is a SECOND testimony,
 *      each D, and a case resting on both reads D.
 *   4. THE ARITHMETIC (op=inquirystrength), DEC-32 unchanged and seeing one more
 *      axis: a mixed basis composes each axis over its own population; grounds
 *      take the strongest branch PER AXIS; the observation's capture axis is
 *      NOT APPLICABLE and says so; an ordinary basis grades EXACTLY as before
 *      (the over-strictness pin, a figure written out here).
 *   5. THE CASE (op=publish): a finding resting on testimony freezes a testimony
 *      row beside capture and connection; an ordinary finding freezes exactly the
 *      two rows it always did; and MK-1's publication fence still refuses the
 *      testimony case at op=caseratify — this item does NOT lift it (MK-3's act).
 *   6. THE CATALOGUE: the frozen published_strength block admits the historic
 *      two rows, requires the testimony row when a leg carries a testimony grade,
 *      and refuses anything else; the no-registry posture; the inherited rule.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { GRADE_AXES, TESTIMONY_GRADE, TESTIMONY_CHECKS, EARNED_CAPTURE_CEILING, BASIS_GRADES,
         checkInquiryBasis, checkBundle, parseFrontmatter,
         /* D-442: the frozen rows moved into the case document; its gate is what judges them now. */
         checkCaseDocument, caseDocumentStatesMemberBlocks } from "../checks/bio-checks.mjs";

const SRC_DIR = fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* CORRECTED 2026-09-21 BY D-436 (IC-172), never exempted: INSTANCE_NAME is bound because every install binds it
     (`newgroup`'s upload, D-102), and a store records its producing group from it at its FIRST BOOT. Unbound, the
     store records none and op=testify (the plane composes the observation and must name its producer) is refused by name (C-64.1) where it used to be handed a literal
     group. 'believe-in-oakland' is this project's own group, the one these fixtures' documents already name. */
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-mk2", MEMBER_TOKEN: "mem-mk2", PROBE_TOKEN: "prb-mk2", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
/* NULL-TOLERANT, so an arm that breaks an answer's shape NAMES the assertions it
   broke instead of ending the module on a TypeError. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const refusedAs = (r, code) => [codeOf(r), r && r.check,
  !!(r && TESTIMONY_CHECKS[code] && r.translation === TESTIMONY_CHECKS[code].translation)];
/* A leg refusal at the write: op=promote answers BASIS_REFUSED with the C-2.8
   findings, and the NAME is the finding's code. */
const legCodes = (r) => (r && Array.isArray(r.findings) ? r.findings : [])
  .filter((x) => x && x.check === "C-2.8").map((x) => x.code ?? null);
const refusedLeg = (r, code) => [r && r.reason, legCodes(r).includes(code)];
const REFUSED = (code) => ["BASIS_REFUSED", true];
/* A pinned axis figure: what a reader is told, minus the arrays of named members. */
const fig = (a) => a ? { state: a.state, grade: a.grade ?? null, weakest: a.weakest ? a.weakest.target_id : null,
                         load_bearing: a.load_bearing, population: a.population } : a;

const NOW = "2026-09-18T00:00:00Z";
const WORDS = "On 10 September at the Clerk's counter I watched the deputy clerk stamp the amended "
            + "contract RECEIVED before the council had voted on it. I was the next person in line.";
const OBSERVED = "2026-09-10";

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role: "admin",
                                        capabilities: ["contribute", "publish"] }, "adm-mk2");
  const en = await post("enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth");
const SAM = await enrol("sam");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const fileOf = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
let snapSeq = 0;
const snapKey = () => `20260918T${String(500000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`;
const promoteDoc = async (id, { docs, register = [] } = {}) => post("promote", {
  bundleId: id, base: null, snapKey: snapKey(),
  meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${id}`,
          current_state: "collected", created: NOW, last_updated: NOW },
  files: [fileOf("bundle.md", infoMd(id)), fileOf("data/provenance.json", JSON.stringify({ documents: docs }))],
  register }, RUTH);
const uploadDoc = (s) => ({
  file: "snapshots/upload.pdf", locator: "handed to a member", retrieved: NOW,
  authority: "synthetic", authority_state: "determined", authority_basis: "fixture",
  capture: { method: "uploaded by a member", grade: "C", actor_class: "member", sha256: s,
             encoding: "binary", bytes: 10 },
  origin: { kind: "member" }, attestation_attempts: [] });

/* An inquiry over a list of legs. A leg is {target, grade?, axis?, source?, ground?}. */
const qMd = (id, legs = [], grounds = []) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What did the clerk do?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
  ...(legs.length ? ["references:", ...[...new Set(legs.map((l) => l.target))].flatMap((tg) => [`  - target: ${tg}`,
                     "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next meeting",
  "    description: The minutes may say otherwise.",
  ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
                     ...(l.grade ? [`    grade: ${l.grade}`, `    grade_axis: ${l.axis}`,
                                    `    grade_source: ${l.source}`] : []),
                     ...(l.ground ? [`    ground: ${l.ground}`] : [])])] : []),
  ...(grounds.length ? ["grounds:", ...grounds.flatMap((g) => [`  - ground: ${g}`,
                        "    asserted_by: ruth", `    at: "${NOW}"`])] : []),
  "---", "", "## Question", "", "What did the clerk do?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${NOW} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const promoteQ = (id, legs, grounds = [], tok = RUTH, extra = {}) => post("promote", { bundleId: id, base: null,
  snapKey: snapKey(), ...extra,
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: "What did the clerk do?",
          current_state: "open", created: NOW, last_updated: NOW },
  files: [fileOf("bundle.md", qMd(id, legs, grounds))] }, tok);
const strength = (id) => get("inquirystrength", `id=${encodeURIComponent(id)}`, RUTH);

/* THE OBSERVATIONS — ruth's, and sam's in IDENTICAL words (two testimonies). */
const tx = await post("testify", { words: WORDS, observedAt: OBSERVED, title: "Stamped before the vote" }, RUTH);
const OBS = tx && tx.bundle_id;
const tx2 = await post("testify", { words: WORDS, observedAt: OBSERVED, title: "Stamped before the vote" }, SAM);
const OBS2 = tx2 && tx2.bundle_id;
/* An ordinary, member-UPLOADED document: origin member, NOT authored. */
const UP = "INFO-2026-5302-upload";
const SU = sha("mk2-upload-bytes");
const up = await promoteDoc(UP, { docs: [uploadDoc(SU)],
  register: [{ sha256: SU, path: "snapshots/upload.pdf", encoding: "binary", bytes: 10 }] });
t("fixture: two observations (ruth, sam — identical words, two bundles) and one uploaded document",
  [tx && tx.ok, tx2 && tx2.ok, OBS !== OBS2, up && up.ok], [true, true, true, true]);

/* ===================== 1. THE REGISTRY ==================================== */
console.log("\n--- 1. what each document earns on each axis (op=earnedbasis) ---");
const Q0 = "INQ-2026-5302-q0";
await promoteQ(Q0, []);
const eb = await get("earnedbasis", `id=${Q0}&targets=${encodeURIComponent(`${OBS},${UP}`)}`, RUTH);
const E = (axis, id) => eb && eb.earned && eb.earned[axis] ? eb.earned[axis][id] : "no-answer";
t("asked about an observation, the registry answers PER AXIS and the testimony map is one of them",
  eb && eb.earned ? Object.keys(eb.earned).sort() : null, ["capture", "connection", "testimony"]);
const ebUp = await get("earnedbasis", `id=${Q0}&targets=${encodeURIComponent(UP)}`, RUTH);
t("OVER-STRICTNESS: asked about NO observation, the answer carries no testimony map at all — the keys it always had (REC-83's byte-identity rule)",
  ebUp && ebUp.earned ? Object.keys(ebUp.earned).sort() : null, ["capture", "connection"]);
const et = E("testimony", OBS);
t("the OBSERVATION earns testimony D, in value mode, from the register's authored flag — and says why",
  et && typeof et === "object" ? [et.grade, et.mode, et.authored, typeof et.why] : et,
  [TESTIMONY_GRADE, "value", 1, "string"]);
const ec = E("capture", OBS);
t("…and NO capture letter (CAPTURE_AXIS_AUTHORED), its empty level now naming the testimony axis it IS graded on",
  ec && typeof ec === "object" ? [ec.grade, ec.undetermined_because, /on the testimony axis at D/.test(ec.empty_level)] : ec,
  [null, "CAPTURE_AXIS_AUTHORED", true]);
t("CONTRAST: the uploaded document earns NO testimony entry, and the fetch ceiling on capture exactly as before",
  [E("testimony", UP), E("capture", UP) && E("capture", UP).grade], [undefined, EARNED_CAPTURE_CEILING]);
t("op=testify's own answer states the testimony axis at D (MK-1 stated it 'not yet carried')",
  tx && tx.axes ? [tx.axes.testimony.grade, tx.axes.testimony.determined, tx.axes.capture.grade] : null,
  [TESTIMONY_GRADE, true, null]);

/* ===================== 2. THE WRITE, BY NAME ============================== */
console.log("\n--- 2. the §7 refusals that fall to MK-2, each by name at op=promote ---");
const ok1 = await promoteQ("INQ-2026-5302-ok", [{ target: OBS, grade: "D", axis: "testimony", source: "testimony" }]);
t("a leg citing the observation at testimony D (source testimony) is ACCEPTED",
  [ok1 && ok1.ok, legCodes(ok1)], [true, []]);
const notD = [];
for (const g of BASIS_GRADES.filter((x) => x !== TESTIMONY_GRADE))
  notD.push(refusedLeg(await promoteQ(`INQ-2026-5302-t${g.toLowerCase()}`,
    [{ target: OBS, grade: g, axis: "testimony", source: "testimony" }]), "testimony-grade-not-d"));
t("ANY testimony grade other than D — A, B and C, each — is REFUSED BY NAME (testimony-grade-not-d)",
  notD, BASIS_GRADES.filter((x) => x !== TESTIMONY_GRADE).map(() => REFUSED()));
t("…and nothing was written: none of those questions exists to grade above D",
  await Promise.all(BASIS_GRADES.filter((x) => x !== TESTIMONY_GRADE)
    .map(async (g) => ((await strength(`INQ-2026-5302-t${g.toLowerCase()}`)) || {}).testimony?.grade ?? null)),
  BASIS_GRADES.filter((x) => x !== TESTIMONY_GRADE).map(() => null));
/* ANY capture grade, whatever its source could claim to be. The earned source is
   the one MK-1 already refused with a generic sentence; the authored ones are
   also refused by REC-18's arm — the NAME is the point, and it is on all four. */
const capCases = [];
for (const g of BASIS_GRADES)
  for (const src of ["capture", "testimony", "hunch"])
    capCases.push([g, src, refusedLeg(await promoteQ(`INQ-2026-5302-c${g.toLowerCase()}-${src}`,
      [{ target: OBS, grade: g, axis: "capture", source: src }]), "testimony-leg-capture-graded")]);
t("ANY capture grade on a leg citing the observation — every letter, earned or authored — is REFUSED BY NAME (testimony-leg-capture-graded)",
  capCases.filter(([, , r]) => JSON.stringify(r) !== JSON.stringify(REFUSED())).map(([g, s, r]) => [g, s, r]), []);
t("…corpus of that arm: 12 legs (4 letters x 3 sources), none silently accepted", capCases.length, 12);
const capB = await promoteQ("INQ-2026-5302-capb2", [{ target: OBS, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture" }]);
const capBf = capB && Array.isArray(capB.findings) ? capB.findings.find((x) => x.code === "testimony-leg-capture-graded") : null;
t("…and it says what the document IS and where its grade belongs, with NO repair sending the member to measure a transcription",
  capBf ? [/is a member's authored observation/.test(capBf.detail ?? capBf.message), /testimony axis/.test(capBf.detail ?? capBf.message),
           capBf.repairs.some((r) => /transcription/.test(r)), capB.findings.filter((x) => x.check === "C-2.8").length]
        : null, [true, true, false, 1]);
const onUp = await promoteQ("INQ-2026-5302-onup", [{ target: UP, grade: "D", axis: "testimony", source: "testimony" }]);
t("testimony on a document that is NOT an observation (the uploaded one) is REFUSED BY NAME (testimony-axis-not-authored)",
  refusedLeg(onUp, "testimony-axis-not-authored"), REFUSED());
const srcBad = [];
for (const src of ["resolution", "hunch", "capture"])
  srcBad.push(refusedLeg(await promoteQ(`INQ-2026-5302-s-${src}`,
    [{ target: OBS, grade: "D", axis: "testimony", source: src }]), "testimony-axis-source"));
t("a testimony-axis grade from any other source — resolution, hunch, capture — is REFUSED BY NAME (testimony-axis-source)",
  srcBad, [REFUSED(), REFUSED(), REFUSED()]);
const onQ = await promoteQ("INQ-2026-5302-onq", [{ target: "INQ-2026-5302-ok", grade: "D", axis: "testimony", source: "testimony" }]);
t("a testimony grade on a leg to another INQUIRY has no referent — REFUSED BY NAME (testimony-axis-no-referent)",
  refusedLeg(onQ, "testimony-axis-no-referent"), REFUSED());
const noneObs = await promoteQ("INQ-2026-5302-none", [{ target: OBS }]);
t("OVER-STRICTNESS: a leg citing the observation with NO grade is accepted — present, not yet load-bearing",
  [noneObs && noneObs.ok], [true]);
const connObs = await promoteQ("INQ-2026-5302-conn", [{ target: OBS, grade: "D", axis: "connection", source: "testimony" }]);
t("OVER-STRICTNESS: a CONNECTION-axis testimony D on the observation is NOT refused — §7 does not list it (a design gap, named, not decided here)",
  [connObs && connObs.ok], [true]);
const upCap = await promoteQ("INQ-2026-5302-upcap", [{ target: UP, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture" }]);
t(`OVER-STRICTNESS: an ordinary capture leg (the uploaded document at ${EARNED_CAPTURE_CEILING}) is accepted exactly as before`,
  [upCap && upCap.ok], [true]);

/* ===================== 3. A SECOND MEMBER DOES NOT RAISE IT =============== */
console.log("\n--- 3. a second member's attestation raises nothing; a second witness is a second testimony ---");
/* The attestation a second member CAN make over a document's text today. There
   is no op by which a member co-signs another member's observation; this is the
   nearest act, and the design's rule is that nothing of the kind moves the
   letter. What is asserted is the axis, whatever the attestation's own answer. */
const att = await post("attesttext", { captureSha: tx && tx.capture_sha, extent: { kind: "document" },
                                        note: "I was there too and saw the same" }, SAM);
console.log(`  note  sam's op=attesttext over ruth's observation answered: ${JSON.stringify(att).slice(0, 220)}`);
const eb2 = await get("earnedbasis", `id=${Q0}&targets=${encodeURIComponent(OBS)}`, RUTH);
t("AFTER sam's attestation, the registry still holds testimony D for ruth's observation",
  eb2 && eb2.earned && eb2.earned.testimony && eb2.earned.testimony[OBS] ? eb2.earned.testimony[OBS].grade : null,
  TESTIMONY_GRADE);
const raised = await promoteQ("INQ-2026-5302-raised", [{ target: OBS, grade: "C", axis: "testimony", source: "testimony" }], [], SAM);
t("…a leg claiming the observation at testimony C because it was attested is REFUSED BY NAME",
  refusedLeg(raised, "testimony-grade-not-d"), REFUSED());
const stillD = await promoteQ("INQ-2026-5302-stilld", [{ target: OBS, grade: "D", axis: "testimony", source: "testimony" }], [], SAM);
t("…while the same leg at D is accepted, and the derived testimony axis reads D",
  [stillD && stillD.ok, fig((await strength("INQ-2026-5302-stilld")).testimony)],
  [true, { state: "graded", grade: TESTIMONY_GRADE, weakest: OBS, load_bearing: 1, population: 1 }]);
const Q2W = "INQ-2026-5302-two-witnesses";
const two = await promoteQ(Q2W, [{ target: OBS, grade: "D", axis: "testimony", source: "testimony" },
                                 { target: OBS2, grade: "D", axis: "testimony", source: "testimony" }]);
const s2w = await strength(Q2W);
t("TWO WITNESSES: ruth's and sam's observations are TWO testimonies, each D — the case rests on both and reads D, not stronger",
  [two && two.ok, fig(s2w && s2w.testimony)],
  [true, { state: "graded", grade: TESTIMONY_GRADE, weakest: OBS, load_bearing: 2, population: 2 }]);
const Q2G = "INQ-2026-5302-two-grounds";
const twoG = await promoteQ(Q2G, [{ target: OBS, grade: "D", axis: "testimony", source: "testimony", ground: "ruth saw it" },
                                  { target: OBS2, grade: "D", axis: "testimony", source: "testimony", ground: "sam saw it" }],
                            ["ruth saw it", "sam saw it"]);
const s2g = await strength(Q2G);
t("…and as two INDEPENDENTLY SUFFICIENT grounds the strongest is still D: agreement is not a stronger grade",
  [twoG && twoG.ok, s2g && s2g.testimony && s2g.testimony.state, s2g && s2g.testimony && s2g.testimony.grade],
  [true, "graded", TESTIMONY_GRADE]);

/* ===================== 4. THE ARITHMETIC ================================== */
console.log("\n--- 4. DEC-32 unchanged, seeing one more axis (op=inquirystrength) ---");
/* THE OVER-STRICTNESS PIN, written out as a FIGURE rather than read off the
   code: an ordinary basis — one capture leg on the uploaded document — reads
   exactly what it read before this item, on both of its old axes, and the new
   axis says the inquiry rests on nothing there. */
const sUp = await strength("INQ-2026-5302-upcap");
t("OVER-STRICTNESS PIN: an ordinary capture leg grades EXACTLY as before — capture B on the uploaded document, connection unrated",
  [fig(sUp && sUp.capture), sUp && sUp.capture && sUp.capture.detail, fig(sUp && sUp.connection)],
  [{ state: "graded", grade: EARNED_CAPTURE_CEILING, weakest: UP, load_bearing: 1, population: 1 },
   `capture ${EARNED_CAPTURE_CEILING} — no stronger than the weakest capture it rests on, which is ${UP}.`,
   { state: "unrated", grade: null, weakest: null, load_bearing: 0, population: 1 }]);
t("…and its testimony axis is UNRATED, resting on nothing on that axis — named, not blank",
  [fig(sUp && sUp.testimony), sUp && sUp.testimony && /UNRATED on testimony/.test(sUp.testimony.detail)],
  [{ state: "unrated", grade: null, weakest: null, load_bearing: 0, population: 1 }, true]);
t("the answer is per axis: exactly capture, connection and testimony beside its own bookkeeping — no composed figure",
  sUp ? ["strength", "grade", "score", "overall"].filter((k) => k in sUp) : null, []);
const QMIX = "INQ-2026-5302-mixed";
const mix = await promoteQ(QMIX, [{ target: UP, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture" },
                                  { target: OBS, grade: "D", axis: "testimony", source: "testimony" }]);
const sMix = await strength(QMIX);
t("MIXED BASIS (unstructured, so every leg is necessary): each axis composes over ITS OWN population — capture B, testimony D, connection unrated",
  [mix && mix.ok, fig(sMix && sMix.capture), fig(sMix && sMix.testimony), sMix && sMix.connection && sMix.connection.state],
  [true, { state: "graded", grade: EARNED_CAPTURE_CEILING, weakest: UP, load_bearing: 1, population: 2 },
         { state: "graded", grade: TESTIMONY_GRADE, weakest: OBS, load_bearing: 1, population: 2 }, "unrated"]);
const nlb = (sMix && sMix.capture && sMix.capture.not_load_bearing || []).find((m) => m.target_id === OBS);
t("THE LIAR REFUSED IN THE ARITHMETIC: the observation is NOT in the capture population — named not load-bearing, NOT APPLICABLE, and saying why",
  nlb ? [nlb.grade, /graded as testimony/.test(nlb.why), /does not apply here/.test(nlb.why)] : null,
  [null, true, true]);
t("…and capture is NOT dragged to D by the testimony leg (the weakest-leg rule never crosses axes)",
  sMix && sMix.capture && sMix.capture.grade, EARNED_CAPTURE_CEILING);
const QOR = "INQ-2026-5302-grounds";
const or = await promoteQ(QOR, [{ target: UP, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture", ground: "the document" },
                                { target: OBS, grade: "D", axis: "testimony", source: "testimony", ground: "the witness" }],
                          ["the document", "the witness"]);
const sOr = await strength(QOR);
t("STRUCTURED BASIS: two independently sufficient grounds — the strongest branch PER AXIS: capture B through the document, testimony D through the witness",
  [or && or.ok, sOr && sOr.capture && [sOr.capture.state, sOr.capture.grade],
   sOr && sOr.testimony && [sOr.testimony.state, sOr.testimony.grade], sOr && sOr.connection && sOr.connection.state],
  [true, ["graded", EARNED_CAPTURE_CEILING], ["graded", TESTIMONY_GRADE], "unrated"]);
t("…and each axis reports BOTH branches, one of them unrated on that axis",
  [sOr && sOr.capture && (sOr.capture.grounds || []).map((g) => [g.ground, g.state]),
   sOr && sOr.testimony && (sOr.testimony.grounds || []).map((g) => [g.ground, g.state])],
  [[["the document", "graded"], ["the witness", "unrated"]], [["the document", "unrated"], ["the witness", "graded"]]]);
/* THE READ CAP. History is append-only and a REPLAYED revision is exempt from
   the write's shape checks by design, so the record may hold a testimony leg at
   a stronger letter than any write would admit. It is read at D and says so. */
const QREP = "INQ-2026-5302-replayed";
/* CORRECTED 2026-09-24 by D-511, never exempted, and it moved TWO things. (1) THE CREDENTIAL: this replayed
   under RUTH'S SESSION and landed, because the exemption was the CALLER'S to claim. BOB #33 ruled `replay` the
   SERVER'S word (INVESTIGATIVE-SESSION.md §11 item 5) and the plane now deletes a caller's flag unless the call
   arrives under the ADMIN class with NO SESSION — the one class `migrate.mjs` uses. (2) THE SHAPE, which makes
   the arm what its own label says: it was a CREATION, and an admin-class creation of a question is asked for its
   surfacing run (REC-171, C-66.1), so moving the credential alone would have measured that instead. A REVISION is
   asked for none. The question is seeded under ruth at the letter the write admits and the root of trust then
   replays the stronger historical letter over it. `surfaced_by` is carried forward verbatim because a revision may
   neither supply nor drop an origin (REC-179, C-66.5) — D-78 stamped `human` on ruth's creation, so the replayed
   bytes say `human` too, and `replay` is no exemption from that rule. */
const repSeed = await promoteQ(QREP, [{ target: OBS, grade: TESTIMONY_GRADE, axis: "testimony", source: "testimony" }]);
const repMd = qMd(QREP, [{ target: OBS, grade: "B", axis: "testimony", source: "testimony" }])
  .replace("surfaced_by: agent", "surfaced_by: human");
const rep = await post("promote", { bundleId: QREP, base: repSeed && repSeed.bundleSha, snapKey: snapKey(),
  replay: true,
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: "What did the clerk do?",
          current_state: "open", created: NOW, last_updated: NOW },
  files: [fileOf("bundle.md", repMd)] }, "adm-mk2");
const sRep = await strength(QREP);
t("A REPLAYED revision holding testimony B is admitted (history is append-only) — and READ at D, saying why",
  [rep && rep.ok, sRep && sRep.testimony && sRep.testimony.grade,
   !!(sRep && sRep.testimony && sRep.testimony.weakest && /read at D here/.test(sRep.testimony.weakest.why || ""))],
  [true, TESTIMONY_GRADE, true]);
/* A testimony axis inherited THROUGH a cited inquiry, per axis, never crossed. */
const QUP = "INQ-2026-5302-cites-q";
const upq = await promoteQ(QUP, [{ target: "INQ-2026-5302-ok" }]);
const sUpq = await strength(QUP);
t("RECURSION: a question resting on a question that rests on testimony carries testimony D up through it — on the testimony axis only",
  [upq && upq.ok, sUpq && sUpq.testimony && [sUpq.testimony.state, sUpq.testimony.grade, sUpq.testimony.weakest && sUpq.testimony.weakest.through],
   sUpq && sUpq.capture && sUpq.capture.state],
  [true, ["graded", TESTIMONY_GRADE, OBS], "unrated"]);

/* ===================== 5. THE CASE ======================================== */
console.log("\n--- 5. the case document's frozen strength (op=publish), and the fence MK-1 built still standing ---");
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and an unnamed one is refused NO_CLAIM. This helper concluded with no
   reading because the act took none; the two findings it concludes (FT, FP) are
   now promoted carrying one (`withAdoptableReading`, one ungraded leg per basis
   target, so no strength read moves) and the call names it. Every other
   question in this suite is left exactly as it was. */
const concl = (id) => get("conclude", `target=${id}&conclusion=${encodeURIComponent("It was stamped first.")}`
  + `&falsifier=${encodeURIComponent("A received-log showing a later stamp would overturn this.")}`
  + adoptedVersionParam(), RUTH);
const promoteConcludable = (id, legs) => post("promote", { bundleId: id, base: null, snapKey: snapKey(),
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: "What did the clerk do?",
          current_state: "open", created: NOW, last_updated: NOW },
  files: [fileOf("bundle.md", withAdoptableReading(qMd(id, legs)))] }, RUTH);
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7); the fixture takes a name and returns the minted id. */
const PROJECT = await makePublishingProject({ post: (q, b) => rP(mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(b ?? {}) }).then((r) => r.json())), mf, sha, machineToken: "adm-mk2",
  owner: "ruth", name: "PROJ-2026-5302-publisher", created: NOW, updated: NOW });
const pubBody = (targets) => ({ project: PROJECT, targets, roles: allLoadBearing({ targets }),
  scope: "Whether the contract was stamped before the vote, on the documents in hand.",
  statement: "This case covers the stamp only, on the documents in hand at edition 1.",
  excluded: [], subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claim to the Clerk on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds that contracts should be adopted in public session." });
/* CORRECTED 2026-09-23 (D-442, BIO_Publication_v0_1.md §3 rule 12), never exempted: the frozen rows were
   read out of the MEMBER's bytes, where op=publish's promotion stamped `published_strength`. Rule 12 stops
   the promotion and states the rows ONCE, in the case document the member's case signs (`case_strength`,
   one row per member per axis). MK-2's rule — testimony frozen only when it carries something — is
   unchanged, and is read where the rows now are; the shape returned is the one the arms below compare. */
const caseDocOf = async (pub) => {
  const d = pub && pub.caseDocument ? await get("casedocument",
    `case=${encodeURIComponent(pub.caseDocument.case_id)}&edition=${pub.caseDocument.edition}`, RUTH) : null;
  return d && typeof d.text === "string" ? d.text : "";
};
const frozenRows = async (id, pub) => {
  const fm = parseFrontmatter(await caseDocOf(pub)).data || {};
  const rows = (fm.case_strength || []).filter((r) => r && r.target === id);
  return rows.length ? rows.map((r) => ({ axis: r.axis, state: r.state, grade: r.grade === null ? "null" : String(r.grade) }))
    : null;
};
const FT = "INQ-2026-5302-case-testimony", FP = "INQ-2026-5302-case-plain";
const ft = await promoteConcludable(FT, [{ target: UP, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture" },
                               { target: OBS, grade: "D", axis: "testimony", source: "testimony" }]);
const fp = await promoteConcludable(FP, [{ target: UP, grade: EARNED_CAPTURE_CEILING, axis: "capture", source: "capture" }]);
const cc = [await concl(FT), await concl(FP)];
const pT = await post("publish", pubBody([FT]), RUTH);
const pP = await post("publish", pubBody([FP]), RUTH);
t("fixture: two concluded findings, and op=publish authors a case document over each",
  [ft && ft.ok, fp && fp.ok, cc.map((c) => c && c.ok), !!(pT && pT.caseDocument), !!(pP && pP.caseDocument)],
  [true, true, [true, true], true, true]);
const axesOf = (p) => p && Array.isArray(p.findings) && p.findings[0] && Array.isArray(p.findings[0].strength)
  ? p.findings[0].strength.map((a) => [a.axis, a.state, a.grade ?? null]) : null;
t("THE CASE RESTING ON TESTIMONY: op=publish answers THREE axes, the testimony one graded D — beside capture and connection, never folded in",
  axesOf(pT), [["capture", "graded", EARNED_CAPTURE_CEILING], ["connection", "unrated", null], ["testimony", "graded", TESTIMONY_GRADE]]);
t("…and the case document's frozen rows for that member are the same three (D-442: stated there, once)",
  await frozenRows(FT, pT), [{ axis: "capture", state: "graded", grade: EARNED_CAPTURE_CEILING },
                         { axis: "connection", state: "unrated", grade: "null" },
                         { axis: "testimony", state: "graded", grade: TESTIMONY_GRADE }]);
t("OVER-STRICTNESS: an ORDINARY case freezes exactly the two rows it always did — no testimony row, nothing moved in its signed bytes",
  [axesOf(pP), await frozenRows(FP, pP)],
  [[["capture", "graded", EARNED_CAPTURE_CEILING], ["connection", "unrated", null]],
   [{ axis: "capture", state: "graded", grade: EARNED_CAPTURE_CEILING }, { axis: "connection", state: "unrated", grade: "null" }]]);
/* MK-1's FENCE IS NOT LIFTED BY THIS ITEM. Driven under a real member's
   signature, because a refusal over a signature nobody could present proves
   nothing. */
if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("  SKIP  the fence arm — ssh-keygen is not on PATH; ratification needs a real member signature");
} else {
  const kdir = mkdtempSync(join(tmpdir(), "mk2-pub-"));
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "ruth", "-f", join(kdir, "ruth"), "-q"]);
  const signBytes = (text) => {
    const f = join(kdir, `stmt-${Math.random().toString(36).slice(2)}`);
    writeFileSync(f, text);
    execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(kdir, "ruth"), "-n", "bio-ratify", f],
      { stdio: ["ignore", "ignore", "ignore"] });
    return readFileSync(f + ".sig", "utf8");
  };
  const keyB64 = readFileSync(join(kdir, "ruth.pub"), "utf8").trim().split(/\s+/)[1];
  const sr = await post("signeradd", { keyB64, memberId: "ruth", comment: "ruth laptop" }, "adm-mk2");
  /* NULL-TOLERANT: when a control breaks op=publish there is no case document,
     and this arm must NAME that rather than end the module on a TypeError
     (measured: the `overstrict` and `liarfull` arms' first runs ended here). */
  const D = (pT && pT.caseDocument) || {};
  const cr = D.case_id ? await post("caseratify", { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha,
    sig: signBytes(`bio-ratify-case ${D.case_id} ${D.edition} ${D.doc_sha}\n`) }, RUTH) : { reason: "NO_CASE_DOCUMENT" };
  t("MK-1's PUBLICATION FENCE STILL STANDS: the testimony case is refused at op=caseratify BY NAME (C-53.12) — lifting it is MK-3's act",
    [sr && sr.ok, ...refusedAs(cr, "TESTIMONY_CASE_UNPUBLISHABLE")],
    [true, "TESTIMONY_CASE_UNPUBLISHABLE", TESTIMONY_CHECKS.TESTIMONY_CASE_UNPUBLISHABLE.check, true]);
}

/* ===================== 6. THE CATALOGUE ==================================== */
console.log("\n--- 6. the catalogue's own arms, over documents no op can yet produce ---");
const judge = (fm, publishedRegistry = null, earnedRegistry = null) => {
  const findings = [];
  checkInquiryBasis(fm, findings, publishedRegistry, earnedRegistry);
  return findings.filter((x) => x.severity === "error").map((x) => [x.check, x.code ?? null]);
};
const leg = (o) => ({ target: OBS, role: "supports", grade: "D", grade_axis: "testimony", grade_source: "testimony", ...o });
const fmOf = (legs) => ({ references: legs.map((l) => ({ target: l.target, rel: "cites", status: "confirmed" })), basis: legs });
t("GRADE_AXES is the catalogue's vocabulary and it carries three axes, connection still at index 1",
  [GRADE_AXES, GRADE_AXES[1]], [["capture", "connection", "testimony"], "connection"]);
t("NO REGISTRY IS NOT A WAY THROUGH: a pure checker cannot confirm the target is an observation — refused by name (testimony-axis-unconfirmable)",
  judge(fmOf([leg({})])), [["C-2.8", "testimony-axis-unconfirmable"]]);
const reg = { earned: { connection: {}, capture: {}, testimony: { [OBS]: { mode: "value", grade: TESTIMONY_GRADE, why: "x" } } } };
t("…and with the record's registry the same leg is clean", judge(fmOf([leg({})]), null, reg), []);
/* The inherited rule, per axis, against a published registry: an edition that
   froze no testimony axis gives nothing to inherit on it. */
const PUBQ = "INQ-2026-5302-published";
const pubReg = (testimony) => ({ [PUBQ]: { latest: 1, editions: { "1": {
  edition: 1, capture: { state: "unrated", grade: null }, connection: { state: "unrated", grade: null },
  ...(testimony ? { testimony } : {}) } } } });
const inh = leg({ target: PUBQ, grade_source: "inherited", target_edition: 1 });
t("INHERITED: an edition that froze NO testimony axis gives nothing to inherit on it — refused (C-21.2), not read as a grade",
  judge(fmOf([inh]), pubReg(null), reg).map(([c]) => c), ["C-21.2"]);
t("…while one that froze testimony D is inherited on the same axis, like any other",
  judge(fmOf([inh]), pubReg({ state: "graded", grade: TESTIMONY_GRADE }), reg), []);
/* The frozen block, through the case gate over a REAL case document (FT's, as op=publish wrote it), with only
   FT's `case_strength` rows varied.
   CORRECTED 2026-09-23 (D-442, BIO_Publication_v0_1.md §3 rule 12), never exempted: this block ran the WHOLE
   member-bytes catalogue over FT's bytes with `published_strength` varied, because that is where op=publish
   froze the rows. Rule 12 moves them into the case document, and C-2.8 FOLLOWS ITS BLOCK: `checkCaseDocument`
   runs `checkPublishedExtension` once per member over the document's statement of it, with the member's own
   `basis` at the pinned bytes. So the SAME arms, the SAME codes (`testimony-axis-unfrozen`, the uncoded shape
   refusals) are asked of the rows where they now live. The member's bytes carry no rows at all. */
const imgT = await get("image", `id=${encodeURIComponent(FT)}`, RUTH);
const docT = await caseDocOf(pT);
const dfmT = parseFrontmatter(docT).data || {};
const basisT = (parseFrontmatter(imgT && typeof imgT["bundle.md"] === "string" ? imgT["bundle.md"] : "").data || {}).basis || [];
const withRows = (rows) => ({ ...dfmT, case_strength: [
  ...(dfmT.case_strength || []).filter((r) => r && r.target !== FT),
  ...rows.map(([a, st, g]) => ({ target: FT, axis: a, state: st, grade: g === "null" ? null : g, weakest: null,
                                  load_bearing: 0, population: 2, detail: "x" }))] });
const c28 = async (fm, dropTestimonyLeg = false) => {
  const basis = dropTestimonyLeg ? basisT.filter((l) => !(l && l.grade_axis === "testimony")) : basisT;
  return checkCaseDocument(fm, { caseId: pT.caseDocument.case_id, edition: pT.caseDocument.edition,
                                 memberBasis: { [FT]: basis } })
    .filter((x) => x && x.check === "C-2.8" && /published_strength/.test(x.message))
    .map((x) => x.code ?? "uncoded");
};
if (docT && Array.isArray(dfmT.case_strength) && dfmT.case_strength.some((r) => r && r.target === FT)) {
  const three = [["capture", "graded", "B"], ["connection", "unrated", "null"], ["testimony", "graded", "D"]];
  /* THE CEREMONY MUST ACTUALLY RUN over a three-row member, or every arm below passes over nothing. Found the
     hard way (MK-2): `isCaseMemberBytes` read `length === 2`. Under rule 12 the door is the document's format. */
  t("the case document op=publish wrote, with THREE frozen rows for its member, states its members' blocks (the ceremony runs over it)",
    [caseDocumentStatesMemberBlocks(dfmT), /^published_strength:$/m.test(String(imgT && imgT["bundle.md"] || ""))], [true, false]);
  t("C-2.8 over the case document op=publish wrote: its member's three frozen rows are clean", await c28(dfmT), []);
  t("…the SAME member with its testimony row REMOVED is refused by name — the case rests on a member's word and must say at what (testimony-axis-unfrozen)",
    await c28(withRows(three.slice(0, 2))), ["testimony-axis-unfrozen"]);
  t("HISTORIC SHAPE: a member with no testimony leg and the two rows every earlier case carries is clean",
    await c28(withRows(three.slice(0, 2)), true), []);
  t("a row for an axis this record does not measure is refused", await c28(withRows([...three, ["score", "graded", "A"]])), ["uncoded"]);
  t("a second testimony row is refused", await c28(withRows([...three, ["testimony", "graded", "D"]])), ["uncoded"]);
  t("a member missing its connection row is still refused, as before", await c28(withRows([three[0], three[2]])), ["uncoded"]);
} else {
  console.log("  FAIL  the catalogue arm had no case document to judge (op=publish or op=casedocument did not answer)");
  fail++;
}

console.log(`\n  corpus: 2 observations (ruth, sam), 1 uploaded document, ${snapSeq} promotions, `
  + `1 attestation attempt, 2 findings published into 2 case documents, 1 case ratification refused`);
console.log(`\n${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`);
  console.log(`\n${pass} pass, ${fail + 1} fail`);
  await mf.dispose().catch(() => {});
  process.exit(1);
}
