/* NEGATIVE CONTROL: RUN 2026-09-18 with `node test/nc-rec87.mjs [arm]` from `bio-plane/`, every arm ALONE with the others held open, each EDITING A REAL SOURCE and restored from a uniquely-named per-arm pristine copy verified by sha256 AND cmp (store.mjs 2,404,730 B, textchain.mjs 80,338 B; 10 of 10 restores byte-identical; never `git checkout --`). Figures are the FINAL tree's run. Declared BEFORE arming, and the result: (a) `baseline` — nothing armed, MUST be green: 55/0. (b) `selfact` — neuter the self-attestation refusal AT THE ACT only; "REFUSED BY NAME" MUST FAIL and "the ceiling DID NOT MOVE" MUST PASS (the read-side exclusion holds alone): 53/2, as declared. (c) `selfboth` — THE ROW'S ARM, neuter BOTH fences so the ceiling rises on one member's word; the refusal AND "did not move" MUST FAIL: 48/7. (d) `portion` — neuter C-52.4; both no-portion arms MUST FAIL (still refused, but by C-45 under the wrong name): 53/2. (e) `machine` — neuter C-52.1; the member-token and admin-token arms MUST FAIL: 53/2. (f) `routing` — stop routing a typing to its own attestations; "THE ROUTING ARM, WHERE IT BITES" MUST FAIL: 48/7. IT CAME BACK WRONG TWICE AND BOTH ARE THE FINDING: first it declared the page-2 assertion, which stayed GREEN because that capture's chain is recorded and the chain-inequality filter already excluded the capture attestation — so a CHAINLESS capture fixture was added, and building it found a REAL DEFECT (C-45.2 refused a typing of a capture with no extraction chain, Bob's own case, fixed by asking the extent grammar under the typing's own chain); then, after `contentRead` stopped reading capture attestations for a typing at all, the op=content half went green under the arm again (protected twice) and the assertion was extended to the LEG path through op=earnedbasis, where the route is the only protection — that half fails as declared. (g) `chainless` — revert the C-45.2 fix; both "WHERE IT BITES" arms MUST FAIL: 53/2. (h) `swallow` — drop `unmeasured: "undetermined"` from the `typed` kind; the CAP-10 swallow arm and the STEP_KINDS pin MUST FAIL: 53/2. (i) `stale` — remove the typing exclusion from the stale pass; "the member's typing does NOT" go stale MUST FAIL: 54/1. (j) `pin` — add one key to op=attesttext's answer; the over-strictness pin MUST SEE it: 54/1. (k) `overstrict` — THE OVER-STRICTNESS DIRECTION, the self-attestation fence refuses EVERY attestor; sam's legitimate attestation and the ceiling move MUST FAIL while "REFUSED BY NAME" MUST PASS: 48/7, as declared.
 *
 * REC-87 / IC-127 / IC-128 — TRANSCRIBE (Bob's 5.2): a member selects a portion
 * of a document and types what it says.
 *
 * WHAT THIS SUITE IS FOR. The row's accepts-when, every half of it THROUGH THE
 * OPS against the real plane in miniflare, under SIGNED-IN members — the act is
 * refused to every machine credential by shape, so a suite driven under the
 * member TOKEN would drive only the refusal:
 *
 *   - a member TRANSCRIBES a portion: the typing is a content row whose chain is
 *     `typed(member)`, its cap UNDETERMINED and STATED;
 *   - a SECOND member ATTESTS it and the ceiling moves as ruled (to the earned
 *     capture ceiling, determinant `attestation`), on op=content, on
 *     op=transcription AND on a leg citing the typing through op=earnedbasis;
 *   - the transcriber's OWN attestation is REFUSED BY NAME (C-52.9) and the
 *     ceiling does not move on it;
 *   - a transcription with NO PORTION selected is refused (C-52.4);
 *   - OVER-STRICTNESS: the existing attestation paths (`op=attesttext`,
 *     `op=textattest`) and a machine-minted row's `op=content` answer are
 *     BYTE-IDENTICAL to the pristine tree's, and are not moved by any typing.
 *
 * THE PRISTINE PINS were measured by running this file's section 0 against
 * `git archive` of the base commit's `bio-plane/src` + `checks` (REC87_SRC=<dir>
 * REC87_MEASURE=1): see PIN_* below.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { TRANSCRIBE_CHECKS, TEXT_CHAIN_CHECKS, EARNED_CAPTURE_CEILING } from "../checks/bio-checks.mjs";
import { checkChain, derivationCap, captureBound, describeChain, STEP_KINDS, isTranscribed,
         tiersEvidenced } from "../src/textchain.mjs";

const SRC_DIR = process.env.REC87_SRC || fileURLToPath(new URL("../src", import.meta.url));
const MEASURE = process.env.REC87_MEASURE === "1";
const IDX = join(SRC_DIR, "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r87", MEMBER_TOKEN: "mem-r87", PROBE_TOKEN: "prb-r87", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
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
const ceil = (x) => x && x.transcription ? [x.transcription.ceiling, x.transcription.determinant,
                                            x.transcription.by] : null;

const NOW = "2026-09-18T00:00:00Z";
const LATER = "2026-09-18T01:00:00Z";

/* THE PRISTINE PINS. sha256 of the JSON answer, measured on the base tree (see
   the header) — the over-strictness arm: nothing about the existing attestation
   paths moved. */
/* MEASURED 2026-09-18 on `git archive` of 694f0a7f (origin/main at this item's
   spawn), REC87_MEASURE=1, exit 0 — and the same three digests printed by this
   item's own tree on its first run, before the pins were written. */
const PIN_ATTESTTEXT = "abbf677d275949ee002ad75324e8827405323db74669edbfeed8e46c134844a5";
const PIN_TEXTATTEST = "8a5948077c0b1d15a487a98083794f5c238986e38cedd36ce369b4bf2110ee4a";
const PIN_MACHINE_CONTENT = "450678c098774793c5d304738cbf4657c36a86401cbef0a25b829fe88e481540";

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role: "admin",
                                        capabilities: ["contribute", "publish"] }, "adm-r87");
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
const inquiryMd = (id, legs = []) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(legs.length ? ["references:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
                     "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  /* CORRECTED 2026-09-23 by REC-179 (C-66.5): this template said `surfaced_by: agent`, but its questions are created by a member SESSION, which D-78 restamps `human` — so every later revision re-sending the template RELABELLED the question `agent`, the defect REC-179 closes (a revision now carries the value forward or is refused SURFACED_BY_REWRITTEN). The template now says what the record holds. */
  "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
                     ...(l.cid ? [`    content_id: "${l.cid}"`] : [])])] : []),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const mustPromote = async (id, text, type, { readings = [] } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (readings.length) {
    const prov = JSON.stringify({ documents: readings });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260918T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files }, RUTH);
  if (r.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
const ocrChain = (version) => [
  { step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
  { step: "ocr", engine: "tesseract", version, cap: "C", confidence: { basis: "none" },
    extent: { kind: "pages", pages: [0, 1, 2] } }];
const readingOf = (captureSha, version) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
             entities: [], text_source: ocrChain(version) } });

const SHA_T = sha("rec87-title-deed");
const DOC = "INFO-2026-8700-deed", DOC_NONE = "INFO-2026-8700-nobytes";
const Q = "INQ-2026-8700-q";
await mustPromote(DOC, infoMd(DOC), "information", { readings: [readingOf(SHA_T, "5.3.4")] });
await mustPromote(DOC_NONE, infoMd(DOC_NONE), "information");
await mustPromote(Q, inquiryMd(Q), "inquiry");

const REGION = { kind: "pdf-page", page: 1, rect: [10, 10, 200, 100] };
const TYPED = "Know all men by these presents, that the Grantor, for the sum of ten dollars, "
            + "conveys unto the Grantee the parcel described as Lot 7, Block 3.";

/* ===================== 0. OVER-STRICTNESS: THE PRISTINE PINS =============== */
console.log("\n--- 0. the existing attestation paths, measured BEFORE anything is typed ---");
/* A machine-marked row on the same page (the member TOKEN is a machine credential
   and may mint — SK-7), read through op=content. */
const mm = await post("contentmint", { bundleId: DOC, extent: { kind: "pdf-page", page: 1 }, at: NOW },
                      "mem-r87");
const MACHINE_ROW = mm && mm.content_id;
/* ruth attests the CAPTURE's machine text over page 1 — which COVERS the region
   she will later type. That coverage is the point: routed wrongly, this
   attestation would raise her typing. */
const at1 = await post("attesttext", { captureSha: SHA_T, at: NOW, extent: { kind: "page", page: 1 },
                                       note: "checked the OCR of page 2" }, RUTH);
const ta1 = await get("textattest", `sha256=${SHA_T}&page=1`, RUTH);
const mc1 = await get("content", `id=${MACHINE_ROW}`, RUTH);
const digests = { attesttext: sha(JSON.stringify(at1)), textattest: sha(JSON.stringify(ta1)),
                  machineContent: sha(JSON.stringify(mc1)) };
console.log(`  corpus: 1 document read at one capture (OCR over pages 0-2, cap C), 1 document with no bytes, `
  + `1 question, 1 machine-marked row, 1 capture attestation; members ruth and sam`);
if (MEASURE) {
  console.log(`  MEASURE ${JSON.stringify(digests)}`);
  console.log(`  MEASURE attesttext ${JSON.stringify(at1)}`);
  await mf.dispose(); process.exit(0);
}
t("the ground: a machine-marked row and a capture attestation exist to be left alone",
  [!!MACHINE_ROW, at1 && at1.ok, ta1 && ta1.count], [true, true, 1]);
t("OVER-STRICTNESS: op=attesttext answers BYTE-IDENTICALLY to the pristine tree",
  digests.attesttext, PIN_ATTESTTEXT);
t("OVER-STRICTNESS: op=textattest answers BYTE-IDENTICALLY to the pristine tree",
  digests.textattest, PIN_TEXTATTEST);
t("OVER-STRICTNESS: op=content on a machine-marked row answers BYTE-IDENTICALLY to the pristine tree",
  digests.machineContent, PIN_MACHINE_CONTENT);

/* ===================== 1. THE GRAMMAR (I2, IC-127) ======================== */
console.log("\n--- 1. the typed(member) step kind ---");
t("STEP_KINDS.typed is a DERIVATION, off the extraction ladder, naming its member, unmeasured => undetermined, letter never",
  STEP_KINDS.typed, { role: "derivation", label: "a member typed the text", tier: null,
                       names: ["member"], unmeasured: "undetermined", letter: "never" });
const one = [{ step: "typed", member: "ruth", text_sha256: sha(TYPED) }];
t("a one-step member chain is well-formed, is a transcription, and its cap is UNDETERMINED (null)",
  [checkChain(one), isTranscribed(one), derivationCap(one), captureBound(one, "B")], [null, true, null, null]);
t("THE SWALLOW CAP-10 FOUND, REFUSED FOR THIS KIND: an OCR letter beside a typed step does NOT bound "
  + "the typing — the chain's cap stays undetermined, and so does the capture bound",
  [derivationCap([{ step: "ocr", engine: "tesseract", cap: "C" }, one[0]]),
   captureBound([{ step: "ocr", engine: "tesseract", cap: "C" }, one[0]], "B")], [null, null]);
const lettered = checkChain([{ step: "typed", member: "ruth", cap: "A" }]);
t("a LETTER on a typed step is refused BY NAME (C-35.14) — nobody grades their own typing",
  [codeOf(lettered), lettered && lettered.check,
   lettered && lettered.translation === TEXT_CHAIN_CHECKS.TEXT_CHAIN_LETTER_ON_PERSON.translation],
  ["TEXT_CHAIN_LETTER_ON_PERSON", "C-35.14", true]);
t("a typed step naming nobody is refused as unnamed (C-35.5)",
  codeOf(checkChain([{ step: "typed" }])), "TEXT_CHAIN_STEP_UNNAMED");
t("describeChain names who typed", describeChain(one), "a member typed the text (ruth)");
t("typing is not an extraction tier: tiersEvidenced skips it and classifies it",
  tiersEvidenced(one), { tiers: [], unclassified: [] });

/* ===================== 2. A MEMBER TRANSCRIBES ============================= */
console.log("\n--- 2. ruth selects a region of page 2 and types it ---");
const tx = await post("transcribe", { bundleId: DOC, extent: REGION, text: TYPED, at: NOW }, RUTH);
const TX = tx && tx.content_id;
t("op=transcribe lands: a NEW content row, typed by ruth, over the region she selected",
  [tx && tx.ok, tx && tx.minted, tx && tx.transcriber, tx && tx.capture_sha, tx && tx.extent_kind,
   tx && tx.text_sha256], [true, true, "ruth", SHA_T, "pdf-page", sha(TYPED)]);
t("its chain is typed(ruth) carrying the text's digest, and says so in words",
  [tx && tx.chain, tx && tx.chain_says],
  [[{ step: "typed", member: "ruth", text_sha256: sha(TYPED) }], "a member typed the text (ruth)"]);
t("its cap is UNDETERMINED and STATED — derivation_cap null, the ceiling null by derivation, with a sentence",
  [tx && tx.derivation_cap, ceil(tx), typeof (tx && tx.transcription && tx.transcription.why)],
  [null, [null, "derivation", []], "string"]);
t("the typing is a different row from the machine's over the same page — the chain is in the address",
  TX !== MACHINE_ROW && typeof TX === "string" && TX.length === 64, true);
const c0 = await get("content", `id=${TX}`, RUTH);
t("op=content resolves it: minted by ruth (a member), not stale, ceiling undetermined, nothing covering",
  [c0 && c0.ok, c0 && c0.minted_by, c0 && c0.mint && c0.mint.machine_work, c0 && c0.stale, ceil(c0),
   c0 && c0.attestations && c0.attestations.all], [true, "ruth", false, false, [null, "derivation", []], []]);
t("THE ROUTING ARM: ruth's capture attestation over page 2 COVERS this region and does NOT raise the typing "
  + "— it checked the OCR, not what she typed",
  [ta1 && ta1.ceiling && ta1.ceiling.determinant, ceil(c0) && ceil(c0)[0]], ["attestation", null]);
/* THE CASE THE ROUTING EXISTS FOR, added after the `routing` control arm came back
   GREEN on the arm above: there, the capture's chain is RECORDED, so the old
   chain-inequality filter already kept its attestation off the typing and the arm
   never exercised the route. Here the capture's reading records NO chain — and a
   NULL is not staleness — so without the route the capture attestation WOULD
   raise the member's typing. */
const SHA_N = sha("rec87-no-chain");
const DOC_N = "INFO-2026-8700-nochain";
await mustPromote(DOC_N, infoMd(DOC_N), "information", { readings: [{
  capture: { sha256: SHA_N, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW, entities: [] } }] });
const atN = await post("attesttext", { captureSha: SHA_N, at: NOW, extent: { kind: "document" } }, SAM);
const txN = await post("transcribe", { bundleId: DOC_N, extent: { kind: "pdf-page", page: 0 }, text: TYPED, at: NOW }, RUTH);
if (!(txN && txN.ok)) console.log(`  note  the no-chain typing was refused: ${JSON.stringify(txN).slice(0, 400)}`);
const cN = await get("content", `id=${txN && txN.content_id}`, RUTH);
t("THE ROUTING ARM, WHERE IT BITES: sam's WHOLE-DOCUMENT attestation of a capture whose chain was never "
  + "recorded does NOT raise ruth's typing of page 1 — and is not listed as covering it",
  [atN && atN.ok, atN && atN.chain_at_attestation, txN && txN.ok, ceil(cN),
   (cN && cN.attestations && cN.attestations.all || []).length], [true, null, true, [null, "derivation", []], 0]);
/* AND ON THE LEG PATH, which is the one a gate reads. `op=content` no longer even
   READS the capture's attestations for a typing, so it is protected twice; the
   registry behind `op=earnedbasis` reads them for every row in a basis and is
   protected by the route ALONE — so this is where the route is proved. (The
   `routing` control arm's second run stayed green on the op=content half alone.) */
const QN = "INQ-2026-8700-qn";
await mustPromote(QN, inquiryMd(QN, [{ target: DOC_N, cid: txN && txN.content_id }]), "inquiry");
const ebN = await get("earnedbasis", `id=${QN}`, RUTH);
t("THE ROUTING ARM, WHERE IT BITES, ON A LEG: a leg citing ruth's typing of the chainless capture earns "
  + "NOTHING from sam's attestation of the capture — through op=earnedbasis",
  ceil(ebN && ebN.earned && ebN.earned.content ? ebN.earned.content[txN && txN.content_id] : null),
  [null, "derivation", []]);
const r0 = await get("transcription", `id=${TX}`, SAM);
t("op=transcription reads the typing back BYTE FOR BYTE, to another member",
  [r0 && r0.ok, r0 && r0.text, r0 && r0.transcriber, r0 && r0.text_sha256, r0 && r0.attestations],
  [true, TYPED, "ruth", sha(TYPED), []]);

/* ===================== 3. THE TYPIST'S OWN ATTESTATION ===================== */
console.log("\n--- 3. ruth attests her own typing ---");
const self = await post("transcriptionattest", { contentId: TX, at: LATER }, RUTH);
t("REFUSED BY NAME: TRANSCRIPTION_SELF_ATTEST, C-52.9, with the catalogue's translation",
  [codeOf(self), self && self.check,
   self && self.translation === TRANSCRIBE_CHECKS.TRANSCRIPTION_SELF_ATTEST.translation],
  ["TRANSCRIPTION_SELF_ATTEST", "C-52.9", true]);
const c1 = await get("content", `id=${TX}`, RUTH);
t("and the ceiling DID NOT MOVE on one member's word", ceil(c1), [null, "derivation", []]);
const machAtt = await post("transcriptionattest", { contentId: TX, at: LATER }, "mem-r87");
t("a machine credential attesting is refused by C-35.10, `checkAttestation`'s fence, unchanged",
  [codeOf(machAtt), machAtt && machAtt.check], ["TEXT_ATTEST_MACHINE", "C-35.10"]);
const smuggle = await post("transcriptionattest", { contentId: TX, at: LATER, member: "sam", attestor: "sam" },
                           "mem-r87");
t("and naming a member in the body does not make it one — the attestor is the control plane's stamp",
  codeOf(smuggle), "TEXT_ATTEST_MACHINE");

/* ===================== 4. A SECOND MEMBER ATTESTS ========================== */
console.log("\n--- 4. sam checks ruth's typing against the page ---");
const sa = await post("transcriptionattest", { contentId: TX, at: LATER, note: "matches the scan" }, SAM);
t("op=transcriptionattest lands for a DIFFERENT member, scoped to exactly the typed region",
  [sa && sa.ok, sa && sa.attestor, sa && sa.transcriber, sa && sa.extent],
  [true, "sam", "ruth", { kind: "region", source: { kind: "pdf-page", ref: "p1", page: 1, rect: [10, 10, 200, 100] } }]);
t("THE CEILING MOVES AS RULED: from undetermined to the earned capture ceiling, determinant attestation, by sam",
  [sa && sa.ceiling_before && sa.ceiling_before.ceiling, ceil(sa)],
  [null, [EARNED_CAPTURE_CEILING, "attestation", ["sam"]]]);
const c2 = await get("content", `id=${TX}`, RUTH);
t("op=content agrees — the ceiling, and sam alone covering",
  [ceil(c2), (c2 && c2.attestations && c2.attestations.covering || []).map((a) => a.attestor)],
  [[EARNED_CAPTURE_CEILING, "attestation", ["sam"]], ["sam"]]);
t("the chain is UNCHANGED by the attestation — verification supersedes as grade determinant, never as record",
  [c2 && c2.chain, c2 && c2.derivation_cap], [[{ step: "typed", member: "ruth", text_sha256: sha(TYPED) }], null]);
const r1 = await get("transcription", `id=${TX}`, RUTH);
t("op=transcription lists sam's attestation as counting, and carries the same ceiling",
  [(r1 && r1.attestations || []).map((a) => [a.attestor, a.counts, a.note]), ceil(r1)],
  [[["sam", true, "matches the scan"]], [EARNED_CAPTURE_CEILING, "attestation", ["sam"]]]);

/* A LEG CITING THE TYPING, through op=earnedbasis — the path `#contentEarned` serves. */
await mustPromote(Q, inquiryMd(Q, [{ target: DOC, cid: TX }]), "inquiry");
const eb = await get("earnedbasis", `id=${Q}`, RUTH);
const ebRow = eb && eb.earned && eb.earned.content ? eb.earned.content[TX] : null;
t("a LEG citing the typing earns what the attestation supports, through op=earnedbasis",
  ceil(ebRow), [EARNED_CAPTURE_CEILING, "attestation", ["sam"]]);

/* ===================== 5. THE REFUSALS ===================================== */
console.log("\n--- 5. what the act refuses, by name ---");
const refused = async (label, body, tok, code, check) => {
  const r = await post("transcribe", body, tok);
  t(label, [codeOf(r), r && r.check,
            !!(r && TRANSCRIBE_CHECKS[code] && r.translation === TRANSCRIBE_CHECKS[code].translation)],
    [code, check, true]);
  return r;
};
await refused("NO PORTION SELECTED (the extent absent) — refused, C-52.4",
  { bundleId: DOC, text: TYPED }, RUTH, "TRANSCRIBE_NO_PORTION", "C-52.4");
await refused("an EMPTY extent is no portion either — refused, C-52.4",
  { bundleId: DOC, extent: {}, text: TYPED }, RUTH, "TRANSCRIBE_NO_PORTION", "C-52.4");
await refused("a machine credential typing is refused BY NAME (C-52.1)",
  { bundleId: DOC, extent: REGION, text: TYPED }, "mem-r87", "TRANSCRIBE_NOT_A_MEMBER", "C-52.1");
await refused("the ADMIN token is a machine too (C-52.1)",
  { bundleId: DOC, extent: REGION, text: TYPED, transcriber: "ruth" }, "adm-r87",
  "TRANSCRIBE_NOT_A_MEMBER", "C-52.1");
await refused("empty text — nothing is prefilled (C-52.6)",
  { bundleId: DOC, extent: REGION, text: "" }, RUTH, "TRANSCRIBE_NO_TEXT", "C-52.6");
await refused("whitespace is not a typing (C-52.6)",
  { bundleId: DOC, extent: REGION, text: "  \n\t " }, RUTH, "TRANSCRIBE_NO_TEXT", "C-52.6");
await refused("over one passage's bound is refused, never truncated (C-52.7)",
  { bundleId: DOC, extent: REGION, text: "x".repeat(128 * 1024 + 1) }, RUTH, "TRANSCRIBE_TEXT_TOO_LONG", "C-52.7");
await refused("a question is not a document (C-52.2)",
  { bundleId: Q, extent: REGION, text: TYPED }, RUTH, "TRANSCRIBE_NO_DOCUMENT", "C-52.2");
await refused("a document this record does not hold answers the same (C-52.2)",
  { bundleId: "INFO-2026-8700-nowhere", extent: REGION, text: TYPED }, RUTH, "TRANSCRIBE_NO_DOCUMENT", "C-52.2");
await refused("a document with no captured copy has no page to type from (C-52.3)",
  { bundleId: DOC_NONE, extent: REGION, text: TYPED }, RUTH, "TRANSCRIBE_NO_BYTES", "C-52.3");
await refused("an image cited AS ITSELF is not text to type (C-52.5)",
  { bundleId: DOC, extent: { kind: "image", page: 1, ref: "a".repeat(64), cited_as: "bytes" }, text: TYPED },
  RUTH, "TRANSCRIBE_PORTION_UNREADABLE", "C-52.5");
const badPage = await post("transcribe", { bundleId: DOC, extent: { kind: "pdf-page", page: "two" },
                                           text: TYPED }, RUTH);
t("a MALFORMED portion is the extent grammar's refusal, C-45, VERBATIM — not restated here",
  [codeOf(badPage), String(badPage && badPage.check).startsWith("C-45.")], ["CONTENT_EXTENT_UNREADABLE", true]);
const nf = await post("transcriptionattest", { contentId: "f".repeat(64) }, SAM);
t("attesting an id that names no typing is refused (C-52.8)",
  [codeOf(nf), nf && nf.check], ["TRANSCRIPTION_NOT_FOUND", "C-52.8"]);
const nfm = await post("transcriptionattest", { contentId: MACHINE_ROW }, SAM);
t("and a MACHINE row is not a typing: op=attesttext is the act for machine text (C-52.8)",
  codeOf(nfm), "TRANSCRIPTION_NOT_FOUND");
t("the read refuses the same way", codeOf(await get("transcription", `id=${MACHINE_ROW}`, SAM)),
  "TRANSCRIPTION_NOT_FOUND");

/* ===================== 6. IDENTITY OF A TYPING ============================ */
console.log("\n--- 6. what makes two typings the same row ---");
const again = await post("transcribe", { bundleId: DOC, extent: REGION, text: TYPED, at: LATER }, RUTH);
t("ruth re-typing the SAME text over the SAME region FINDS her row — minted false, same id",
  [again && again.ok, again && again.minted, again && again.content_id === TX], [true, false, true]);
const other = await post("transcribe", { bundleId: DOC, extent: REGION, text: TYPED + " (corrected)", at: LATER }, RUTH);
t("DIFFERENT text is a DIFFERENT row, and it starts undetermined — sam's attestation was of the other typing",
  [other && other.ok, other && other.content_id !== TX, ceil(other)], [true, true, [null, "derivation", []]]);
const samTypes = await post("transcribe", { bundleId: DOC, extent: REGION, text: TYPED, at: LATER }, SAM);
t("the SAME text typed by ANOTHER member is its own row, attestable by ruth",
  [samTypes && samTypes.ok, samTypes && samTypes.content_id !== TX], [true, true]);
const cross = await post("transcriptionattest", { contentId: samTypes && samTypes.content_id, at: LATER }, RUTH);
t("ruth may attest SAM's typing — the refusal is of the typist, not of anyone who ever typed",
  [cross && cross.ok, ceil(cross)], [true, [EARNED_CAPTURE_CEILING, "attestation", ["ruth"]]]);
const wholeDoc = await post("transcribe", { bundleId: DOC, extent: { kind: "document" }, text: TYPED }, SAM);
t("the WHOLE document NAMED as the portion is legal — content goes up to and including the document",
  [wholeDoc && wholeDoc.ok, wholeDoc && wholeDoc.extent_kind], [true, "document"]);

/* ===================== 7. A MACHINE RE-READ DOES NOT STALE A TYPING ========= */
console.log("\n--- 7. the capture is re-read by a newer engine ---");
await mustPromote(DOC, infoMd(DOC), "information", { readings: [readingOf(SHA_T, "5.4.0")] });
const mc2 = await get("content", `id=${MACHINE_ROW}`, RUTH);
const c3 = await get("content", `id=${TX}`, RUTH);
t("the machine row minted under the old chain goes STALE, as it always did",
  mc2 && mc2.stale, true);
t("the member's typing does NOT — nothing she typed from changed, and its ceiling stands",
  [c3 && c3.stale, ceil(c3)], [false, [EARNED_CAPTURE_CEILING, "attestation", ["sam"]]]);

/* ===================== 8. THE EXISTING PATHS, AFTER ======================= */
console.log("\n--- 8. the capture's attestations are untouched by any typing ---");
const ta2 = await get("textattest", `sha256=${SHA_T}&page=1`, RUTH);
t("op=textattest still lists ONLY ruth's capture attestation — no typing's attestation leaked into it",
  [ta2 && ta2.count, (ta2 && ta2.attestations || []).map((a) => a.attestor)], [1, ["ruth"]]);

/* ===================== 9. PURGE ============================================ */
console.log("\n--- 9. purge clears the typings with their document ---");
const pg = await post("purge", {}, "adm-r87", `&confirm=bio&bundleId=${encodeURIComponent(DOC)}`);
t("op=purge of the document succeeds", !!(pg && pg.ok), true);
t("and the typing no longer resolves", codeOf(await get("transcription", `id=${TX}`, RUTH)),
  "TRANSCRIPTION_NOT_FOUND");

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}
await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
