/* NEGATIVE CONTROL: RUN 2026-09-18, every arm AS DECLARED, every restore byte-identical by sha256 AND cmp — baseline 52 pass / 0 fail; inplace 35/17 (refused at promote by C-25.2 VERSION_NAME_NOT_UNIQUE — the old reading cannot be re-pointed under its own name); wider 46/6; grade 51/1; capture 47/5; machine 49/3 (its FIRST run did NOT ARM — the bare condition matched 13 times — and was re-anchored on the refusal it guards); unlabelled 51/1; overstrict 27/25 (the candidate list empties first, so the act is refused NARROW_NO_EXTENT before the relation is even asked). Two MUST-PASS declarations were corrected after the first run, not the assertions: wider/same/sideways are asked of the narrowed reading, so an arm that stops it landing takes them down too. The arms live in `test/nc-rec86.mjs` and are re-run in one step with `node test/nc-rec86.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`). Declared BEFORE arming — what MUST fail and what MUST NOT: (a) `baseline` — nothing armed; MUST be green, the row that tells all-arms-working from all-arms-broken. (b) `inplace` — THE 5.8 ARM: in store.mjs `narrow()` write the new reading under the SOURCE's name (`nameWritten` -> `src.vname` in the composed rows), i.e. a narrowing that would move the OLD version's target; the old version's leg MUST NOT move, so the act MUST be refused (the freeze, C-25.11, fires at promote) and the "old reading keeps its row" and "a new reading exists" arms MUST FAIL, while the refusal arms (wider, same, disjoint) stay green. (c) `wider` — neuter the NOT_NARROWER gate in store.mjs (`relation !== "narrower"` -> `false`); the "a WIDER part is refused BY NAME" arm and its "same"/"disjoint" siblings MUST FAIL, and the over-strictness arms stay green. (d) `grade` — carry the old grade onto the narrowed leg (the GRADE_KEYS skip neutered); the "the narrowed leg lands UNGRADED" arm MUST FAIL. (e) `capture` — neuter the NARROW_OTHER_CAPTURE comparison (`chosenRow.capture_sha !== src.row.capture_sha` -> `false` and the bundle half with it); the cross-capture and cross-document arms MUST FAIL. (f) `machine` — neuter the NARROW_NOT_A_MEMBER fence (`!who || isMachineIdentity(who)` -> `!who`); the machine-credential arm MUST FAIL. (g) `overstrict` — THE OVER-STRICTNESS DIRECTION: make `extentRelation` answer `disjoint` for document -> pdf-page; the legal narrowing arms MUST FAIL (a fence tighter than its rule refuses the one act the ruling licenses) while every refusal arm stays green.
 *
 * REC-86 / IC-123 — NARROW (Bob's 5.3, with his 2026-09-14 second pass on 5.4):
 * a member makes an existing citation more specific, choosing from a
 * machine-proposed candidate list or naming the part themselves.
 *
 * WHAT THIS SUITE IS FOR. The row's accepts-when is that narrowing produces a
 * new version with the narrower row and leaves the OLD version and ITS row
 * untouched, and that a narrowing to a WIDER extent is refused by name. Both are
 * driven here THROUGH THE OPS, against the real plane in miniflare, under a
 * signed-in member — because the act is refused to a machine credential by
 * shape, a suite that drove it under the member TOKEN would drive only the
 * refusal. The record-overclaim half is asserted explicitly: the narrowed leg
 * carries no borrowed grade, the new reading is born `suggested`, the
 * candidate read writes nothing, and every candidate is labelled machine work.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { extentRelation, NARROW_CHECKS, parseFrontmatter } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r86", MEMBER_TOKEN: "mem-r86", PROBE_TOKEN: "prb-r86", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r86", qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-r86") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
/* NULL-TOLERANT, so an arm that breaks the answer's shape NAMES the assertions
   it broke instead of ending the module on a TypeError. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;

const NOW = "2026-09-18T00:00:00Z";
const LATER = "2026-09-18T01:00:00Z";

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role: "admin",
                                        capabilities: ["contribute", "publish"] }, "adm-r86");
  const en = await post("enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth");

const refLines = (targets) => ["references:",
  ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])];
const legField = (k, v) => v === undefined ? []
  : typeof v === "number" ? [`    ${k}: ${v}`]
  : Array.isArray(v) ? [`    ${k}: [${v.join(", ")}]`]
  : [`    ${k}: "${v}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => [`  - name: "${v.name}"`, `    description: "${v.description}"`,
    `    relationship: "and"`, `    state: "suggested"`, `    derived_from: null`, `    hidden: false`,
    `    author: "ruth"`, `    at: "${NOW}"`].join("\n"));
  const grounds = versions.map((v) => [`  - version: "${v.name}"`, `    ground: "paper"`,
    `    asserted_by: "ruth"`, `    at: "${NOW}"`].join("\n"));
  const legs = versions.flatMap((v) => v.legs.map((l) => [`  - version: "${v.name}"`,
    `    target: "${l.target}"`, `    role: "supports"`, `    ground: "paper"`,
    ...legField("grade", l.grade), ...legField("grade_axis", l.grade_axis),
    ...legField("grade_source", l.grade_source),
    ...legField("extent_kind", l.kind), ...legField("extent_page", l.page),
    ...legField("extent_rect", l.rect), ...legField("extent_capture", l.capture)].join("\n")));
  return ["basis_versions:", ...rows, "basis_version_grounds:", ...grounds, "basis_version_legs:", ...legs];
};
const inquiryMd = (id, { refs = [], versions = [], subject = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  ...(subject ? [`subject_entity: ${subject}`] : []),
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(versions.length ? versionLines(versions) : []),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
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
const HEAD = new Map();
const mustPromote = async (id, text, type, { readings = [] } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (readings.length) {
    const prov = JSON.stringify({ documents: readings });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260918T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files }, RUTH);
  if (r.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
const chain = (pages) => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
    extent: { kind: "pages", pages } }];
const readingOf = (captureSha, pages, entities = [], at = NOW) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0, at,
             entities, text_source: chain(pages) } });
const imageOf = async (id) => (await get("file", `id=${id}&path=bundle.md`, RUTH))?.text ?? "";
const versionRowsOf = async (id) => (await get("basisversions", `id=${id}`, RUTH)).versions ?? [];
const legsOf = async (id, name) => ((await versionRowsOf(id)).find((v) => v.name === name)?.legs) ?? [];
/* THE CONTENT ROW EACH VERSION LEG RESOLVES TO, read out of the projection by
   op=promote's own after-write SELECT (`version_content`) — op=basisversions does
   not publish the column, and a leg's row is the thing this item must not move. */
const cidOf = (vc, version, ord) => (vc || []).find((r) => r.version === version && r.ord === ord)?.content_id ?? null;
const narrow = (body, tok = RUTH, qs = "") => post("narrow", body, tok, qs);

/* ===================== 0. THE GROUND ==================================== */
console.log("\n--- 0. a subject, a document read with positions, a reading citing it whole ---");

const ent = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] }, "adm-r86");
const ORD = ent.entity_id;
const SHA_A = sha("rec86-doc-a"), SHA_A2 = sha("rec86-doc-a-later"), SHA_B = sha("rec86-doc-b");
const DOC_A = "INFO-2026-8600-alpha", DOC_B = "INFO-2026-8600-beta", DOC_NONE = "INFO-2026-8600-nobytes";
const SUB = "INQ-2026-8600-sub", INQ = "INQ-2026-8600-main";

await mustPromote(DOC_A, infoMd(DOC_A), "information", { readings: [
  readingOf(SHA_A, [0, 1, 2], [
    { ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680",
      source: { kind: "pdf-page", ref: "page 2", page: 1 } },
    { ref: "meeting:77", kind: "meeting", key: "77", label: "Meeting 77",
      source: { kind: "pdf-page", ref: "page 3", page: 2 } }]),
  /* A LATER COPY of the same document — the 5.8 arm's subject. */
  readingOf(SHA_A2, [0, 1, 2], [], LATER)] });
await mustPromote(DOC_B, infoMd(DOC_B), "information", { readings: [readingOf(SHA_B, [0, 1])] });
await mustPromote(DOC_NONE, infoMd(DOC_NONE), "information");
await mustPromote(SUB, inquiryMd(SUB), "inquiry");
const res = await post("resolve", { captureSha: SHA_A }, "adm-r86");
t("the ground: op=resolve ties the page-2 reference in DOC_A to the question's subject",
  [res.resolved_count >= 1, (res.resolved || []).some((r) => r.entity_id === ORD)], [true, true]);

const WHOLE = "whole documents";
const rInq = await mustPromote(INQ, inquiryMd(INQ, { refs: [DOC_A, DOC_B, DOC_NONE, SUB], subject: ORD, versions: [
  { name: WHOLE, description: "The first reading, citing each document whole.",
    legs: [{ target: DOC_A, grade: "A", grade_axis: "connection", grade_source: "resolution" },
           { target: DOC_B, kind: "pdf-page", page: 0 },
           { target: DOC_NONE }, { target: SUB }] },
  /* A reading that pins a leg to the LATER copy of DOC_A, so a content row exists
     there for the cross-capture arm to name. */
  { name: "later copy", description: "A reading resting on the later copy of the document.",
    legs: [{ target: DOC_A, kind: "pdf-page", page: 1, rect: [0, 0, 50, 50], capture: SHA_A2 }] },
] }), "inquiry");

const before = await legsOf(INQ, WHOLE);
const oldCid = cidOf(rInq.version_content, WHOLE, 0);
const oldBLeg = cidOf(rInq.version_content, WHOLE, 1);
const imgBefore = await imageOf(INQ);
const wholeBlock = (img) => {
  const fm = parseFrontmatter(img).data || {};
  return JSON.stringify([(fm.basis_versions || []).find((v) => v.name === WHOLE),
    (fm.basis_version_grounds || []).filter((g) => g.version === WHOLE),
    (fm.basis_version_legs || []).filter((l) => l.version === WHOLE)]);
};
console.log(`  corpus: 3 information documents (one read at two captures, one never read), 1 sub-question, `
          + `1 inquiry with ${(await versionRowsOf(INQ)).length} readings; the whole-document leg's row ${String(oldCid).slice(0, 12)}…`);
t("the ground: the reading's first leg resolves to a WHOLE-DOCUMENT row, graded A on the connection axis",
  [!!oldCid, before[0]?.grade ?? null, before.length], [true, "A", 4]);

/* ===================== 1. THE PREDICATE ================================= */
console.log("\n--- 1. extentRelation — narrower, and nothing else, is narrower ---");
const P = (page, rect) => ({ kind: "pdf-page", page, ...(rect ? { rect } : {}) });
t("document -> a page is NARROWER; a page -> the document is WIDER",
  [extentRelation({ kind: "document" }, P(1)), extentRelation(P(1), { kind: "document" })], ["narrower", "wider"]);
t("a page -> a region of it is NARROWER; a region -> a region inside it is NARROWER",
  [extentRelation(P(1), P(1, [0, 0, 5, 5])), extentRelation(P(1, [0, 0, 5, 5]), P(1, [1, 1, 2, 2]))],
  ["narrower", "narrower"]);
t("an inverted spelling of one rect is the SAME rect, not a narrowing",
  extentRelation(P(1, [0, 0, 5, 5]), P(1, [5, 5, 0, 0])), "same");
t("a different page is DISJOINT — moving a citation sideways is not making it more precise",
  extentRelation(P(1), P(2, [0, 0, 1, 1])), "disjoint");
t("an extent this plane cannot evaluate is UNREADABLE, never narrower (the default is no)",
  [extentRelation({ kind: "dom" }, P(1)), extentRelation({ kind: "document" }, { kind: "dom" })],
  ["unreadable", "unreadable"]);
t("the office arms narrow by their finer field only",
  [extentRelation({ kind: "doc-para", para: 3 }, { kind: "doc-para", para: 3, run: 1 }),
   extentRelation({ kind: "doc-para", para: 3 }, { kind: "doc-para", para: 4, run: 1 }),
   extentRelation({ kind: "slide-shape", slide: 2 }, { kind: "slide-shape", slide: 2, shape: 0 })],
  ["narrower", "disjoint", "narrower"]);
t("the refusal family is eleven rows, all C-50, each with a translation",
  [Object.keys(NARROW_CHECKS).length,
   Object.values(NARROW_CHECKS).every((r) => /^C-50\.\d+$/.test(r.check) && r.translation.length > 40)],
  [11, true]);

/* ===================== 2. THE CANDIDATES (MACHINE WORK) ================ */
console.log("\n--- 2. op=narrowcandidates — the machine proposes, labelled, and writes nothing ---");
const statsBefore = (await get("stats", "", RUTH)).content;
const shaBefore = HEAD.get(INQ);
const cands = await get("narrowcandidates", `target=${INQ}&version=${encodeURIComponent(WHOLE)}&ord=0`, RUTH);
t("the read answers for the leg it was asked about, from the capture that leg rests on",
  [cands.ok, cands.leg?.target, cands.leg?.content_id === oldCid, cands.leg?.capture_sha === SHA_A],
  [true, DOC_A, true, true]);
const readingCands = (cands.candidates || []).filter((c) => c.source === "reading");
t("the plane's own reading proposes BOTH positioned references, each a page of this capture",
  readingCands.map((c) => [c.extent.kind, c.extent.page]).sort(), [["pdf-page", 1], ["pdf-page", 2]]);
t("the reference that names the question's SUBJECT is marked so, and listed FIRST; the other is marked not",
  [(cands.candidates || [])[0]?.mentions_subject, (cands.candidates || [])[0]?.extent?.page,
   readingCands.find((c) => c.extent.page === 2)?.mentions_subject], [true, 1, false]);
t("EVERY candidate is labelled machine work, and the answer calls itself proposals only",
  [(cands.candidates || []).length > 0, (cands.candidates || []).every((c) => c.machine_work === true),
   cands.proposal_only, /PROPOSAL/.test(cands.says || "")], [true, true, true, true]);
t("each candidate carries the fields op=narrow takes, ready to send",
  (cands.candidates || [])[0]?.fields, { extent_kind: "pdf-page", extent_page: 1 });
t("LISTING WROTE NOTHING: no content row minted and the question's bytes unmoved",
  [(await get("stats", "", RUTH)).content, (await get("bundle", `id=${INQ}`, RUTH)).bundle?.bundle_sha ?? HEAD.get(INQ)],
  [statsBefore, shaBefore]);

/* A MACHINE MARKS A PASSAGE CITABLE (SK-7) — the third source. The member token
   is a MACHINE credential by this record's own predicate, so the row it mints
   is machine-marked. */
const marked = await post("contentmint", { bundleId: DOC_A, extent: P(0, [10, 10, 90, 90]) });
const cands2 = await get("narrowcandidates", `target=${INQ}&version=${encodeURIComponent(WHOLE)}&ord=0`, RUTH);
const markedCand = (cands2.candidates || []).find((c) => c.source === "marked");
t("a row a machine marked citable is proposed too, by its content id, labelled machine-marked",
  [marked.ok, markedCand?.content_id === marked.content_id, markedCand?.mint?.state, markedCand?.fields],
  [true, true, "machine_marked", { content_id: marked.content_id }]);

const unread = await get("narrowcandidates", `target=${INQ}&version=${encodeURIComponent(WHOLE)}&ord=2`, RUTH);
t("a leg with NO PART to point at is refused by name: a document this record holds no copy of",
  [codeOf(unread), unread.check], ["NARROW_NO_PART", "C-50.4"]);
const subLeg = await get("narrowcandidates", `target=${INQ}&version=${encodeURIComponent(WHOLE)}&ord=3`, RUTH);
t("and a leg resting on another QUESTION is refused the same way — a question has no pages",
  codeOf(subLeg), "NARROW_NO_PART");
const bLeg = await get("narrowcandidates", `target=${INQ}&version=${encodeURIComponent(WHOLE)}&ord=1`, RUTH);
t("a read document with no positioned references STATES the empty level rather than answering bare",
  [bLeg.ok, (bLeg.candidates || []).length, bLeg.absence?.level], [true, 0, "content"]);

/* ===================== 3. THE ACT ======================================= */
console.log("\n--- 3. op=narrow — a NEW reading, one leg narrower, the old one untouched ---");
const NARROWED = "the subject page";
const act = await narrow({ target: INQ, version: WHOLE, ord: 0, name: NARROWED,
  description: "Rests the ordinance leg on page 2, where the transfer ordinance is actually cited.",
  extent: (cands.candidates || [])[0]?.fields });
t("the act lands: a new reading, derived from the old, born SUGGESTED, in the member's name",
  [act.ok, act.version, act.derived_from, act.state, act.author], [true, NARROWED, WHOLE, "suggested", "ruth"]);
/* Diagnostic, not an assertion: when a control arm stops the act landing, say WHAT
   refused it, so the arm's record names the gate that fired. */
if (!act.ok) console.log(`  note  the act was refused: ${codeOf(act)} ${JSON.stringify(act.findings ?? act.detail ?? "").slice(0, 300)}`);
const after = await legsOf(INQ, WHOLE);
const neu = await legsOf(INQ, NARROWED);
const newCid = cidOf(act.version_content, NARROWED, 0);
t("THE OLD READING KEEPS ITS ROW: its leg still resolves to the whole-document row it always did",
  [!!oldCid && cidOf(act.version_content, WHOLE, 0) === oldCid, act.narrowed?.from?.unchanged,
   act.narrowed?.from?.still_held_by],
  [true, true, WHOLE]);
t("and its grade is exactly as it was — the old reading is not rewritten in any field",
  [after[0]?.grade, after.length], ["A", 4]);
t("THE OLD READING'S BYTES ARE BYTE-IDENTICAL in the document (row, parts and legs)",
  wholeBlock(await imageOf(INQ)) === wholeBlock(imgBefore), true);
t("A NEW READING exists with the same number of legs, and its first leg names a DIFFERENT, narrower row",
  [neu.length, !!newCid && newCid !== oldCid && act.narrowed?.to?.content_id === newCid], [4, true]);
const toRow = await get("content", `id=${newCid}`, RUTH);
t("the narrower row is page 2 of THE SAME CAPTURE the old row was minted on",
  [toRow.ok, toRow.content?.extent_kind ?? toRow.extent_kind, (toRow.content?.extent ?? toRow.extent)?.page,
   (toRow.content?.capture_sha ?? toRow.capture_sha) === SHA_A],
  [true, "pdf-page", 1, true]);
const oldRow = await get("content", `id=${oldCid}`, RUTH);
t("and the old row still exists, still the whole document — nothing was re-pointed or deleted",
  [oldRow.ok, oldRow.content?.extent_kind ?? oldRow.extent_kind], [true, "document"]);
t("D-350 CLOSED: op=basisversions now SERVES which part each leg rests on — the same ids op=promote read back",
  [neu[0]?.content_id ?? "ABSENT", after[0]?.content_id ?? "ABSENT", neu[2]?.content_id === null,
   Object.prototype.hasOwnProperty.call(neu[3] || {}, "content_id")],
  [newCid, oldCid, true, true]);
t("the other legs are carried unchanged — the leg on DOC_B resolves to the row it did",
  [!!oldBLeg, cidOf(act.version_content, NARROWED, 1) === oldBLeg], [true, true]);
t("THE NARROWED LEG LANDS UNGRADED: the whole document's A is NOT borrowed by page 2 (5.1)",
  [neu[0]?.grade ?? null, act.grade_not_carried?.was?.grade], [null, "A"]);
t("the answer names the machine proposal the member chose, labelled machine work",
  [act.chosen_from?.source, act.chosen_from?.machine_work], ["reading", true]);
const img = await imageOf(INQ);
t("the act accounts for itself in the Session Log: derived from, the old unchanged, chosen from a proposal",
  [/Narrowed a citation \| ruth/.test(img), new RegExp(`'${WHOLE}' is unchanged`).test(img),
   /Chosen from a machine proposal \(reading\)/.test(img)], [true, true, true]);
const partsNew = (parseFrontmatter(img).data?.basis_version_grounds || []).filter((g) => g.version === NARROWED);
t("the new reading's partition is carried and asserted in the NARROWING member's name, never the old asserter's",
  partsNew.map((g) => [g.ground, g.asserted_by]), [["paper", "ruth"]]);

const byId = await narrow({ target: INQ, version: WHOLE, ord: 0, name: "the marked region",
  description: "Rests the ordinance leg on the region of page 1 a machine marked as citable.",
  extent: { content_id: marked.content_id } });
t("choosing a machine-MARKED row by its content id lands, and the row keeps its machine label",
  [byId.ok, byId.narrowed?.to?.content_id === marked.content_id, byId.narrowed?.to?.mint?.state,
   byId.chosen_from?.source], [true, true, "machine_marked", "marked"]);
const byHand = await narrow({ target: INQ, version: NARROWED, ord: 0, name: "the table on page 2",
  description: "Narrows the page-2 citation further, to the table that carries the transfer amount.",
  extent: { extent_kind: "pdf-page", extent_page: "1", extent_rect: "[20, 20, 80, 60]" } });
t("a member may NAME the part by hand, and narrow a narrowed reading again (page -> region of it)",
  [byHand.ok, byHand.derived_from, byHand.chosen_from, byHand.narrowed?.to?.extent?.rect],
  [true, NARROWED, null, [20, 20, 80, 60]]);

/* ===================== 4. WHAT IT REFUSES =============================== */
console.log("\n--- 4. refused BY NAME: wider, same, sideways, in place, elsewhere, by a machine ---");
const base = { target: INQ, ord: 0, description: "An attempt the record must refuse, recorded for the suite." };
const wider = await narrow({ ...base, version: NARROWED, name: "wider", extent: { extent_kind: "document" } });
t("a narrowing to a WIDER extent is refused BY NAME, and says which way it went",
  [codeOf(wider), wider.check, wider.relation], ["NARROW_NOT_NARROWER", "C-50.9", "wider"]);
const same = await narrow({ ...base, version: NARROWED, name: "same", extent: { extent_kind: "pdf-page", extent_page: 1 } });
t("the SAME part is refused — nothing was made more specific", [codeOf(same), same.relation], ["NARROW_NOT_NARROWER", "same"]);
const side = await narrow({ ...base, version: NARROWED, name: "sideways",
  extent: { extent_kind: "pdf-page", extent_page: 2, extent_rect: [0, 0, 5, 5] } });
t("a region of a DIFFERENT page is refused — sideways is not narrower", [codeOf(side), side.relation],
  ["NARROW_NOT_NARROWER", "disjoint"]);
const inPlace = await narrow({ ...base, version: WHOLE, name: WHOLE, extent: { extent_kind: "pdf-page", extent_page: 1 } });
t("5.8: a narrowing that would move the OLD reading's citation in place (its own name) is refused BY NAME",
  [codeOf(inPlace), inPlace.taken], ["NARROW_NAME", true]);
const laterRow = cidOf(rInq.version_content, "later copy", 0);
const elsewhere = await narrow({ ...base, version: WHOLE, name: "later", extent: { content_id: laterRow } });
t("5.8: a part of a LATER COPY of the same document is refused — that is re-anchoring, not narrowing",
  [!!laterRow, codeOf(elsewhere), elsewhere.to_capture === SHA_A2], [true, "NARROW_OTHER_CAPTURE", true]);
const otherDoc = await narrow({ ...base, version: WHOLE, name: "other doc", extent: { content_id: oldBLeg } });
t("a part of a DIFFERENT document is refused by the same name", codeOf(otherDoc), "NARROW_OTHER_CAPTURE");
const machine = await narrow({ ...base, version: WHOLE, name: "by machine",
  extent: { extent_kind: "pdf-page", extent_page: 1 } }, "mem-r86");
t("a MACHINE credential is refused by name — it proposes, it does not choose",
  [codeOf(machine), machine.check], ["NARROW_NOT_A_MEMBER", "C-50.5"]);
const noExt = await narrow({ ...base, version: WHOLE, name: "nothing" });
t("naming no part is refused by name", codeOf(noExt), "NARROW_NO_EXTENT");
const unknown = await narrow({ ...base, version: WHOLE, name: "stray", extent: { extent_kind: "pdf-page", extent_page: 1, extent_color: "red" } });
t("a field the act does not take is refused by name, never dropped", [codeOf(unknown), unknown.got], ["NARROW_BAD_EXTENT", ["extent_color"]]);
const both = await narrow({ ...base, version: WHOLE, name: "both", extent: { content_id: marked.content_id, extent_kind: "pdf-page" } });
t("a content id AND a description of a part is refused — one fact written twice", codeOf(both), "NARROW_BAD_EXTENT");
const malformed = await narrow({ ...base, version: WHOLE, name: "badpage", extent: { extent_kind: "pdf-page", extent_page: "two" } });
t("a malformed extent is refused by REC-84's ONE checker, under op=promote's own name", codeOf(malformed), "BASIS_REFUSED");
const noDesc = await narrow({ ...base, version: WHOLE, name: "undescribed", description: "", extent: { extent_kind: "pdf-page", extent_page: 1 } });
t("a new reading with no account of what changed is refused by name", codeOf(noDesc), "NARROW_NO_DESCRIPTION");
const noVer = await narrow({ ...base, version: "no such reading", name: "x1", extent: { extent_kind: "pdf-page", extent_page: 1 } });
const noLeg = await narrow({ ...base, version: WHOLE, ord: 9, name: "x2", extent: { extent_kind: "pdf-page", extent_page: 1 } });
const noInq = await narrow({ ...base, target: "INQ-2026-8600-absent", version: WHOLE, name: "x3", extent: { extent_kind: "pdf-page", extent_page: 1 } });
t("an absent question, reading or leg is each refused by its own name",
  [codeOf(noInq), codeOf(noVer), codeOf(noLeg)], ["NARROW_NO_INQUIRY", "NARROW_NO_SUCH_VERSION", "NARROW_NO_SUCH_LEG"]);
t("EVERY refusal carries its OWN C-number, C-50.1 through C-50.11, each driven through the op",
  [noInq.check, noVer.check, noLeg.check, unread.check, machine.check, noExt.check, unknown.check,
   elsewhere.check, wider.check, inPlace.check, noDesc.check],
  ["C-50.1", "C-50.2", "C-50.3", "C-50.4", "C-50.5", "C-50.6", "C-50.7", "C-50.8", "C-50.9", "C-50.10", "C-50.11"]);
t("and each carries the canned translation a member reads, not only a code",
  [noInq, noVer, noLeg, unread, machine, noExt, unknown, elsewhere, wider, inPlace, noDesc]
    .every((r) => typeof r.translation === "string" && r.translation === NARROW_CHECKS[r.code]?.translation), true);
t("NONE of the refused attempts wrote a reading", (await versionRowsOf(INQ)).map((v) => v.name).sort(),
  [NARROWED, "later copy", "the marked region", "the table on page 2", WHOLE].sort());

/* ===================== 5. OVER-STRICTNESS =============================== */
console.log("\n--- 5. over-strictness: promote without narrowing is unchanged ---");
const plain = "INQ-2026-8600-plain";
const pr = await mustPromote(plain, inquiryMd(plain, { refs: [DOC_A], versions: [
  { name: "plain", description: "A plain reading nobody narrows.", legs: [{ target: DOC_A }] }] }), "inquiry");
t("a question promoted with a reading and never narrowed lands exactly as before: one reading, and its leg on the SAME whole-document row the first question's leg got",
  [pr.ok !== false, (await versionRowsOf(plain)).length, cidOf(pr.version_content, "plain", 0) === oldCid],
  [true, 1, true]);
const adminRead = await get("narrowcandidates", `target=${INQ}&version=${encodeURIComponent(WHOLE)}&ord=0`, "adm-r86");
t("the candidate read is reachable by every class that may read, not only a session",
  adminRead.ok, true);

} catch (e) {
  /* A THROW IS A FAILURE AND IS COUNTED AS ONE, and the stack is printed, so an
     arm that breaks the fixture names what it broke rather than reading clean. */
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}

/* THE FOOT. `mf.dispose()` is not optional: a suite that prints its tally and
   hangs is indistinguishable from one still running. The exit is on the suite's
   OWN RESULT and never under a conditional. */
console.log(`\nnarrow: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
