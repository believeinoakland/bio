/* case-grammar tests: a whole `/7` case (or `/6`, by `format`) and its case file, as `case-authoring` and `public-read` would write them,
   built from this module's own line builders; the manifest's part fingerprints computed here a second way. */
import { createHash } from "node:crypto";
import * as CG from "../../../src/case-grammar/index.mjs";
import { sha, NOW, V } from "./helpers.mjs";

const bytesOf = (s) => Buffer.byteLength(s, "utf8");
/** A part's fingerprint, spelled a second way (K1318): one line per file of the part, in path order, and the sum of
    sizes. */
export const digest = (files, index) => {
  const mine = files.filter((f) => f.part === index).map((f) => f.path).sort()
    .map((p) => files.find((f) => f.path === p && f.part === index));
  return { sha256: createHash("sha256").update(mine.map((f) => `${f.path} ${f.sha256} ${f.bytes}\n`).join("")).digest("hex"),
           bytes: mine.reduce((n, f) => n + f.bytes, 0) };
};
export const KEY = { key: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyBytesForTheFixture group@lakeshore",
                     fingerprint: `SHA256:${"a".repeat(42)}0` };
/** A manifest over `files` (`{path, sha256, bytes, part, kind}`), each part fingerprinted. */
export const manifestFor = (files, over = {}) => {
  const sorted = [...files].sort((a, b) => (a.path < b.path ? -1 : 1));
  const parts = [...new Set(sorted.map((f) => f.part))].sort((a, b) => a - b).map((index) => ({ index, ...digest(sorted, index) }));
  const doc = sorted.find((f) => f.kind === "case_document");
  return { format: "bio-case-file/1", group: "lakeshore-tenants", case: "CASE-2026-0001", edition: 2,
           case_document_sha: doc ? doc.sha256 : null, keys: [KEY], parts, files: sorted, ...over };
};

export const A = "INQ-2026-0001-lease";
export const B = "INQ-2026-0002-board";
export const C = "INQ-2026-0003-context";
export const MINUTES = "INFO-2026-0001-minutes";
export const OBS = "INFO-2026-0009-observation";
export const MINUTES_SHA = sha("the minutes' bytes");
export const REF = `imported:${sha("an import")}/INQ-2026-0042-lease`;
export const SECRET_SOURCE = "Pat the clerk";

const rows = (key, list) => (list.length ? [`${key}:`, ...list.flatMap((r) => Object.entries(r)
  .map(([k, v], i) => `${i ? "   " : "  -"} ${k}: ${v === null ? "null" : typeof v === "string" ? `"${v}"` : v}`))] : [`${key}: []`]);

/** The grading facts and passages the case signs (R17), as case-authoring R54 writes them. */
export const LEGS = [
  { finding: A, ord: 1, target: MINUTES, kind: "document", role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture",
    ground: null, origins: [MINUTES_SHA], origins_complete: true, captures: [MINUTES_SHA] },
  { finding: A, ord: 2, target: B, kind: "inquiry", role: "supports", grade: null, grade_axis: null, grade_source: "inherited",
    ground: "the record", answer: { capture: { state: "graded", grade: "B" } } },
  { finding: A, ord: 3, target: REF, kind: "imported", role: "supports", grade: null, grade_axis: null, grade_source: null, ground: null },
  { finding: B, ord: 1, target: OBS, kind: "observation", role: "cuts_against", grade: "D", grade_axis: "testimony",
    grade_source: "testimony", ground: null, author_key: "k1" },
  { finding: B, ord: 2, target: A, kind: "inquiry", role: "supports" },
];
export const PASSAGES = [{ finding: A, ord: 1, content_id: sha("passage"), capture_sha: MINUTES_SHA,
  extent: { page: 3, start: 10, end: 52 }, chain: null, quoted: "No vote was taken on item 7 <the lease>. It's \"final\" # here" }];

/** T33-60: a calculation a member's chain reaches (R18), with its inputs' canonical bytes, and a timeline (R20). */
export const RECIPE = { method: "bio-calc/1", inputs: [{ name: "payments", kind: "table" }],
  steps: [{ op: "sum", as: "total", from: "payments", field: "amount" }], output: "total" };
export const INPUT_BYTES = '{"fields":[{"name":"amount","type":"number"}],"rows":[["10.50"],["4.25"]]}';
export const CALCS = [{ calc: "CALC-2026-0001", recipe: RECIPE, inputs: { payments: sha(INPUT_BYTES) },
  method_version: "bio-calc/1", results: { total: { value: "14.75", sign: "+", precision: "exact" } }, recompute: "differs",
  disclosed: "The stored total was taken before a late payment was added; we disclose that it differs." }];
export const TIMELINE = [
  { lane: "we_did", ord: 2, when: { day: "2026-09-12", precision: "day" }, label: "We filed the records request.", ref: "ACTN-2026-0002", source: { entry: "ACTN-2026-0002#1" } },
  { lane: "they_did", ord: 1, when: { day: "2026-03-04", precision: "day" }, label: "The board approved the lease.", ref: "EVT-2026-abcdefgh12345678", source: { capture: MINUTES_SHA, extent: { page: 3 } } },
  { lane: "we_did", ord: 1, when: { state: "undetermined", low: "2026-08-01", high: "2026-08-31" }, label: "We read the minutes.", ref: null, source: MINUTES_SHA },
  { lane: "they_did", ord: 2, when: "nowhere", label: "An undated memo circulated.", ref: null, source: { capture: sha("memo") } },
];

/** T37 (N757): a photo the case carries as its copy (R12's `obscured`), its original's bytes and its copy's, and the
    label `case-carriage` gives it (its `OBSCURED_LABEL`, as its R11 words it). */
export const PHOTO = "INFO-2026-0004-photo";
export const PHOTO_BYTES = "JPEG the original photo, faces and a plate visible";
export const PHOTO_COPY_BYTES = "JPEG the copy, the marked areas covered";
export const OBSCURED_LABEL = "Faces and plates obscured for publication; the group holds the original";
export const PHOTO_ROW = { ref: PHOTO, kind: "document", sha: sha(PHOTO_BYTES), text_sha: sha("the photo's text"),
  origin: "a member's capture", archived_copy: null, included: false, rests_under: "load_bearing",
  obscured: { copy: sha(PHOTO_COPY_BYTES), label: OBSCURED_LABEL } };

/** The case document's text, `/7` (the format written) unless `format` says otherwise; `t33` adds R18's and R20's
    blocks; `photo` adds a third material, a photo carried as its copy (T37). */
export function caseDocument({ bar = { declared: true, capture: "B", connection: "C" }, blocks = true,
                               format = CG.CASE_DOCUMENT_FORMAT, t33 = false, photo = false } = {}) {
  const fm = [
    "---", `format: ${format}`, "case_id: CASE-2026-0001", "case_edition: 2", "case_project: PROJ-2026-0001-parks",
    'case_scope: "Who approved the lease, and on what record."',
    'bias_acknowledgement: "We expected the board to defer to the vendor."',
    "bias_manifest:", "  in_force: true", "  scope: project", "  scope_id: PROJ-2026-0001-parks", `  statements_sha: ${sha("lens")}`,
    ...CG.lensBlockLines([{ bundle: "BIAS-2026-0001-p", id: "s1", kind: "scrutiny", subject: "ENT-2026-0001",
      text: "Vendor filings need a second source.", justification: "Two were corrected.",
      citations: ["INFO-2026-0003-x", { citation: "SECRET-CITATION", printed: false }] }]),
    ...CG.whatChangedBlockLines({ statement: "Added the 2019 minutes.", began_as: "member" }),
    `case_findings: [${A}, ${C}]`,
    ...rows("case_roles", [{ target: A, role: "load_bearing", version_sha: sha("A"), edition: 1 },
                           { target: C, role: "supporting", version_sha: sha("C"), edition: 1 }]),
    ...rows("case_conclusions", [{ target: A, relationship: "project", claim_state: "adopted", claim: "The board approved the lease without a vote." },
                                 { target: C, relationship: "no_project", claim_state: "undetermined", claim: "", claim_detail: "no reading named" }]),
    "tensions_disclosed: 1", "tensions_highlighted: 0",
    ...rows("case_tensions", [{ candidate: "c1", finding: A, state: "open", kind: null, unseen_other_side: false,
      a_text: "The minutes say no vote", b_text: "The press release says a vote", explanation: null, words: "We disclose it." }]),
    "case_tension_sentences: []",
    ...CG.captureBlockLines([{ capture: MINUTES_SHA, member: A, grade: "B", grade_basis: "fetched" }]),
    ...CG.sourceBlockLines([{ capture: MINUTES_SHA, stated: CG.withheldSourceStatement({ capture: MINUTES_SHA, received: NOW }), basis: null }]),
    ...CG.methodBlockLines({ grading: "bio-grading/1", checks: "1.61.0" }),
    ...CG.materialBlockLines({
      materials: [{ ref: MINUTES, kind: "document", sha: MINUTES_SHA, text_sha: sha("the minutes' text"), origin: "https://records.example/m.pdf",
                    archived_copy: "https://archive.example/m", included: true, rests_under: "load_bearing" },
                  { ref: OBS, kind: "observation", sha: sha("obs"), text_sha: null, origin: "a member's observation",
                    archived_copy: null, included: false, rests_under: "supporting" }, ...(photo ? [PHOTO_ROW] : [])],
      attestations: [{ ref: MINUTES, by_kind: "member", by: V("heron"), level: "group", at: NOW, signature: "SIG" },
                     { ref: MINUTES, by_kind: "project", by: "PROJ-2026-0001-parks", at: NOW, recorded_in: MINUTES },
                     { ref: MINUTES, by_kind: "group", by: "lakeshore-tenants" },
                     { ref: OBS, by_kind: "member", by: V("olive"), level: "name", at: NOW, signature: "SIG2" }] }),
    ...CG.acceptedWorkBlockLines({
      rows: [{ member: A, leg_of: A, ref: REF, group: "riverside-watch", case: "CASE-2026-0007", edition: 2,
               finding: "INQ-2026-0042-lease", manifest_sha: sha("their manifest"), pair: { capture: "B", connection: "C" },
               result: "recreated_in_part", gaps: ["the 2019 contract, not fetched"], accepted_by: V("olive"), accepted_at: NOW,
               reason: "We read it twice." }],
      flags: [{ ref: REF, edition: 2, flag: "FLAG-1", issue: "The lease date may be wrong.", flagged_at: NOW,
                words: "We disclose it.", acknowledged_by: V("olive"), acknowledged_at: NOW }] }),
    ...(blocks ? [...CG.gradingFactsLines(LEGS), ...CG.passagesLines(PASSAGES)] : []),
    ...(t33 ? [...CG.calculationsLines(CALCS), ...CG.timelineLines(TIMELINE)] : []),
    "searched:", '  computed_at: "2026-09-30T00:00:00Z"', "  subject_source: case", "  subjects: 3", "  looked: 2",
    ...rows("searched_levels", [{ level: "document", subject_kind: "document", outcome: "looked", subjects: 3, looked: 2,
                                  never_looked: 0, undetermined: 1, detail: "One was never logged." }]),
    ...rows("case_strength", [{ target: A, axis: "capture", state: "graded", grade: "B" }, { target: A, axis: "connection", state: "graded", grade: "C" },
                              { target: C, axis: "capture", state: "graded", grade: "D" }, { target: C, axis: "connection", state: "undetermined", grade: null }]),
    "required_strength:", `  declared: ${bar.declared}`, "  source: project", `  capture: ${bar.capture ?? "null"}`,
    `  connection: ${bar.connection ?? "null"}`, '  detail: ""',
    "---"];
  const body = ["", "# Case CASE-2026-0001 — edition 2", "", ...CG.whatChangedSectionLines("Added the 2019 minutes."), "## Scope", "",
                "Who approved the lease.", ""];
  const text = [...fm, ...body].join("\n");
  /* a /6 document was written before strength R35's `undetermined` (K1608) reached R17's rows: as it was written then */
  return format === CG.CASE_DOCUMENT_FORMAT_V6 ? text.replace(/\n {4}undetermined: null(?=\n)/g, "") : text;
}

/** A whole case file: `{manifest, files}` (`format` the case file's, `bio-case-file/1` unless `fileFormat` says), `files` a Map of path to text, the complete edition rendered from the rest. */
export function caseFileFixture(opts = {}) {
  const text = new Map([
    [CG.caseFilePath("case_document"), caseDocument(opts)],
    [CG.caseFilePath("case_signature"), "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n"],
    [CG.caseFilePath("finding", A), "---\nid: A\n---\n"],
    [CG.caseFilePath("finding_signature", A), "sig A"],
    [CG.caseFilePath("finding", C), "---\nid: C\n---\n"],
    [CG.caseFilePath("finding_signature", C), "sig C"],
    ...[A, B, C].map((f) => [CG.caseFilePath("grading_facts", f),
      JSON.stringify({ legs: LEGS.filter((l) => l.finding === f).map(({ finding, ord, ...leg }) => leg) })]),
    [CG.caseFilePath("passages", A), JSON.stringify(PASSAGES.map(({ finding, ord, ...q }) => q))],
    [CG.caseFilePath("document", MINUTES), "%PDF the minutes' bytes"],
    [CG.caseFilePath("extracted_text", MINUTES), "No vote was taken on item 7 <the lease>."],
    [CG.caseFilePath("attestation", [MINUTES, "account-1.txt"]), "I pulled it from the box."],
    ...(opts.t33 ? [[CG.caseFilePath("calculation", CALCS[0].calc), CG.calculationFileText(CALCS[0])],
                    [CG.caseFilePath("calculation", [CALCS[0].calc, sha(INPUT_BYTES)]), INPUT_BYTES],
                    [CG.caseFilePath("calculation", "prov"), CG.provOf(CALCS)]] : []),
    ...(opts.photo ? [[CG.caseFilePath("obscured", PHOTO), PHOTO_COPY_BYTES]] : []),
  ]);
  const listed = (m) => [...m].map(([path, t]) => ({ path, sha256: sha(t), bytes: bytesOf(t), part: 1,
                                                     kind: CG.caseFileEntryOf(path).kind }));
  const over = opts.fileFormat ? { format: opts.fileFormat } : {};
  const edition = CG.completeEditionOf(editionInput(manifestFor(listed(text), over), text));
  text.set(CG.caseFilePath("complete_edition"), edition);
  return { manifest: manifestFor(listed(text), over), files: text };
}

/** R14's input (K1315 (4)) from a manifest and a Map of path to content: the manifest's facts and every file but the
    complete edition, with no part. */
export function editionInput(manifest, files) {
  const { parts, files: rows, ...facts } = manifest;
  return { ...facts, files: rows.filter((f) => f.kind !== "complete_edition")
    .map(({ part, ...f }) => ({ ...f, content: files.get(f.path) })) };
}
