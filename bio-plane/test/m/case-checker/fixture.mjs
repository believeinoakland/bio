/* case-checker tests: a whole `/6` case and its case file, as `case-authoring` writes the document and `public-read`
   packs it (`case-grammar` R11–R17 line builders and paths; stored ZIP parts by `public-read`'s serialiser), signed with
   real keys. Each grade the document records is what `strength` computed at the act, here `recomputePair` over the same
   facts, so a clean case file recreates every finding; a test then changes one thing and sees the checker notice. */
import { createHash } from "node:crypto";
import * as CG from "../../../src/case-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { contentIdFor } from "../../../src/content/extent.mjs";
import { recomputePair, GRADING_METHOD_VERSION } from "../../../src/strength/method.mjs";
import { CATALOG_VERSION } from "../../../src/gate.mjs";
import { serialiseContainer } from "../../../src/container.mjs";
import { ratifyStatement, caseRatifyStatement, captureAccountStatement, NS_RATIFY } from "../../../src/sshsig.mjs";
import { signSshsig, signerPublicLine } from "../../../scripts/sign-sshsig.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
export const te = new TextEncoder();
export const NOW = "2026-10-02T12:00:00Z";

/** A signing key from a label: its envelope, its public key line and its bare base64. */
export function keyFor(label) {
  const seed = createHash("sha256").update(`case-checker:${label}`).digest();
  const env = `BIOKEY-RAW1.bio-ratify.${seed.toString("base64")}`;
  const line = signerPublicLine(env, label);
  return { env, line, b64: line.split(" ")[1] };
}
export const fingerprintOf = (b64) => "SHA256:" + createHash("sha256").update(Buffer.from(b64, "base64")).digest("base64").replace(/=+$/, "");
export const sign = (who, message, ns = NS_RATIFY) => signSshsig(keyFor(who).env, Buffer.from(message), ns);
/* R3: a member signs their account over `signatures.captureAccountStatement` (its R41). */
export const accountMessage = (capSha, text) => captureAccountStatement(capSha, text);

export const GROUP = "lakeshore-tenants";
export const CASE = "CASE-2026-0001";
export const A = "INQ-2026-0001-lease";        // load-bearing member
export const C = "INQ-2026-0003-context";      // supporting member
export const B = "INQ-2026-0002-board";        // reached from A's chain
export const MINUTES = "INFO-2026-0001-minutes";
export const MEMO = "INFO-2026-0002-memo";     // from a source whose identity is withheld
export const OBS = "INFO-2026-0009-observation";
export const MINUTES_BYTES = "%PDF-1.7 the minutes of the board, as captured";
export const MEMO_BYTES = "%PDF-1.7 the memo a clerk handed over";
export const OBS_TEXT = "I watched the board vote by a show of hands.";
export const MINUTES_SHA = sha(MINUTES_BYTES), MEMO_SHA = sha(MEMO_BYTES), OBS_SHA = sha(OBS_TEXT);
export const REF = `imported:${sha("an import")}/INQ-2026-0042-lease`;
export const ACCOUNT = "I pulled it from the records office's box on the 3rd.";
export const MEMO_ACCOUNT = "A clerk handed me this memo in person.";

const MINUTES_UNITS = [{ extent: { kind: "pdf-page", page: 0 }, ref: "page 1", text: "Item 7. The lease was approved without a vote." },
                       { extent: { kind: "pdf-page", page: 1 }, ref: "page 2", text: "Adjourned at nine." }];
const MEMO_UNITS = [{ extent: { kind: "pdf-page", page: 0 }, ref: "page 1", text: "Please sign the lease before the meeting." }];
export const extracted = (units) => CG.extractedTextOf(units);

const PAIR_AXES = ["capture", "connection", "testimony"];
const pairOf = (r) => Object.fromEntries(PAIR_AXES.map((a) => [a, { state: r[a].state, grade: r[a].grade ?? null }]));

/** The grading facts of each finding, and each pair as the act computed it. */
export function gradingFacts({ withImported = false } = {}) {
  const B_legs = [
    { target: MINUTES, kind: "document", role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture", ground: null, captures: [MINUTES_SHA] },
    { target: MEMO, kind: "document", role: "supports", grade: "B", grade_axis: "connection", grade_source: "resolution", ground: null, captures: [MEMO_SHA] }];
  const Bpair = pairOf(recomputePair({ legs: B_legs, version: GRADING_METHOD_VERSION }));
  const A_legs = [
    { target: MINUTES, kind: "document", role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture", ground: null, captures: [MINUTES_SHA] },
    { target: B, kind: "inquiry", role: "supports", grade: null, grade_axis: null, grade_source: "inherited", ground: null, answer: Bpair },
    ...(withImported ? [{ target: REF, kind: "imported", role: "supports", grade: null, grade_axis: null, grade_source: "inherited", ground: null }] : [])];
  const C_legs = [{ target: OBS, kind: "observation", role: "supports", grade: "D", grade_axis: "testimony", grade_source: "testimony", ground: null }];
  return { [A]: { legs: A_legs }, [B]: { legs: B_legs }, [C]: { legs: C_legs } };
}
export const IMPORTED_PAIR = { capture: { state: "graded", grade: "B" }, connection: { state: "graded", grade: "C" } };
export function pairsOf(facts, accepted = []) {
  const out = {};
  for (const [id, f] of Object.entries(facts)) {
    const legs = f.legs.map((l) => (l.kind === "imported" ? { ...l, answer: (accepted.find((r) => r.ref === l.target) || {}).pair } : l));
    out[id] = pairOf(recomputePair({ legs, version: GRADING_METHOD_VERSION }));
  }
  return out;
}

const q = (v) => (v === null ? "null" : typeof v === "string" ? `"${v}"` : String(v));
const rows = (key, list) => (list.length ? [`${key}:`, ...list.flatMap((r) => Object.entries(r)
  .map(([k, v], i) => `${i ? "   " : "  -"} ${k}: ${q(v)}`))] : [`${key}: []`]);

/** The `/6` case document's text. */
export function caseDocument({ pairs, bar = { declared: true, capture: "B", connection: "C" }, findings = { [A]: "load_bearing", [C]: "supporting" },
                              pins, materials, attestations, accounts, accepted = [], edition = 2, recorded = null,
                              facts = {}, passages = {} } = {}) {
  const roster = Object.keys(findings);
  const rec = recorded || pairs;
  const fm = [
    "---", "format: bio-case-document/6", `case_id: ${CASE}`, `case_edition: ${edition}`, "case_project: PROJ-2026-0001-parks",
    'case_scope: "Who approved the lease, and on what record."',
    'bias_acknowledgement: "We expected the board to defer to the vendor."',
    "bias_manifest:", "  in_force: false", '  stated: "no manifest was in force"', "  pins_proposed: 0",
    '  pins_proposed_stated: "no adoption pinned a proposed revision"',
    "bias_manifest_bundles: []", "bias_manifest_pins_proposed: []",
    ...CG.lensBlockLines([]),
    ...CG.whatChangedBlockLines({ statement: "Added the 2019 minutes.", began_as: "member" }),
    ...rows("case_citations", [{ target: MINUTES, version: "pinned", capture: MINUTES_SHA }]),
    `case_findings: [${roster.join(", ")}]`,
    ...rows("case_roles", roster.map((m) => ({ target: m, role: findings[m], version_sha: pins[m], edition: 1 }))),
    "case_tensions: []", "case_tension_sentences: []", "case_tensions_unread: []",
    ...rows("capture_accounts", accounts),
    ...CG.methodBlockLines({ grading: GRADING_METHOD_VERSION, checks: CATALOG_VERSION }),
    ...CG.materialBlockLines({ materials, attestations }),
    ...CG.acceptedWorkBlockLines({ rows: accepted, flags: [] }),
    ...CG.gradingFactsLines(Object.entries(facts).flatMap(([finding, f]) => f.legs.map((l, ord) => ({ finding, ord, ...l })))),
    ...CG.passagesLines(Object.entries(passages).flatMap(([finding, list]) => list.map((p, ord) => ({ finding, ord, ...p })))),
    "completeness:", '  statement: "the 2019 permits are not covered"', "  author: alice", "  statement_by: bob",
    '  at: "2026-09-28T00:00:00Z"', "  subject_position: not_sought", '  subject_justification: "the office is closed until October"',
    "  acknowledged: 1",
    ...rows("completeness_acknowledgements", [{ kind: "participant", by: "carol", at: "2026-09-27T00:00:00Z" }]),
    ...rows("completeness_excluded", [{ target: null, description: "the 2019 permits", reason: "not yet requested" }]),
    "searched:", "  subject_source: case_basis", "  subjects: 2", "searched_levels: []",
    ...rows("case_strength", roster.flatMap((m) => PAIR_AXES.map((axis) => ({ target: m, axis, state: rec[m][axis].state, grade: rec[m][axis].grade })))),
    "case_strength_grounds: []",
    "required_strength:", `  declared: ${bar.declared}`, "  source: project", `  capture: ${bar.capture ?? "null"}`,
    `  connection: ${bar.connection ?? "null"}`, '  detail: ""',
    "---"];
  const body = ["", `# Case ${CASE} — edition ${edition}`, "", ...CG.whatChangedSectionLines("Added the 2019 minutes."),
                "## Scope", "", "Who approved the lease.", "", "## What This Excludes", "", "the 2019 permits", ""];
  return [...fm, ...body].join("\n");
}

/** A finding's published bytes. */
export const findingText = (id) => `---\nid: ${id}\nobject_type: inquiry\ntitle: "${id}"\nbasis: []\n---\n\nWhat ${id} found.\n`;

/** The whole case, as text by path, before packing. `opts` change one thing for a negative control. */
export function caseFiles(opts = {}) {
  const facts = opts.facts || gradingFacts(opts);
  const accepted = opts.withImported ? [{ member: A, leg_of: A, ref: REF, group: "riverside-watch", case: "CASE-2026-0007", edition: 2,
    finding: "INQ-2026-0042-lease", manifest_sha: sha("their manifest"), pair: IMPORTED_PAIR, result: "recreated", gaps: null,
    accepted_by: "olive", accepted_at: NOW, reason: "We recreated it and read it twice." }] : [];
  const pairs = pairsOf(facts, accepted);
  const findings = opts.findings || { [A]: "load_bearing", [C]: "supporting" };
  const texts = new Map();
  const put = (kind, key, text) => texts.set(CG.caseFilePath(kind, key), text);
  const pins = {};
  for (const id of [A, B, C]) {
    put("finding", id, findingText(id));
    if (findings[id]) { pins[id] = sha(findingText(id)); put("finding_signature", id, sign(opts.findingSigner || "alice", ratifyStatement(id, pins[id]))); }
    put("grading_facts", id, JSON.stringify(facts[id]));
  }
  const passageExtent = { kind: "pdf-page", page: 0 };
  const passage = { content_id: contentIdFor(MINUTES_SHA, passageExtent, null), capture_sha: MINUTES_SHA, extent: passageExtent, chain: null,
                    quoted: opts.quoted || "The lease was approved without a vote." };
  const passages = { [A]: [passage], [B]: [], [C]: [] };
  for (const [id, list] of Object.entries(passages)) put("passages", id, JSON.stringify(list));
  put("document", MINUTES, MINUTES_BYTES);
  put("extracted_text", MINUTES, extracted(MINUTES_UNITS));
  put("document", MEMO, MEMO_BYTES);
  put("extracted_text", MEMO, extracted(MEMO_UNITS));
  put("observation", OBS, OBS_TEXT);
  const materials = [
    { ref: MINUTES, kind: "document", sha: MINUTES_SHA, text_sha: sha(extracted(MINUTES_UNITS)), origin: "https://records.example/minutes.pdf",
      archived_copy: "https://archive.example/minutes", included: true, rests_under: "load_bearing" },
    { ref: MEMO, kind: "document", sha: MEMO_SHA, text_sha: sha(extracted(MEMO_UNITS)), origin: "Withheld: the source did not consent to be named",
      archived_copy: null, included: opts.memoIncluded ?? true, rests_under: "load_bearing" },
    { ref: OBS, kind: "observation", sha: OBS_SHA, text_sha: null, origin: "a member's observation", archived_copy: null, included: true,
      rests_under: "supporting" }];
  const accounts = [
    { capture: MINUTES_SHA, by: "alice", at: NOW, text_b64: Buffer.from(ACCOUNT).toString("base64"),
      signature_b64: Buffer.from(sign("alice", accountMessage(MINUTES_SHA, ACCOUNT))).toString("base64") },
    { capture: MEMO_SHA, by: "bob", at: NOW, text_b64: Buffer.from(MEMO_ACCOUNT).toString("base64"),
      signature_b64: Buffer.from(sign(opts.memoAccountSigner || "bob", opts.memoAccountMessage || accountMessage(MEMO_SHA, opts.memoAccountSigned || MEMO_ACCOUNT), opts.memoAccountNamespace)).toString("base64") }];
  const attestations = [
    { ref: MINUTES, by_kind: "member", by: "alice", level: "name", at: NOW, signature: accounts[0].signature_b64 },
    { ref: MINUTES, by_kind: "project", by: "PROJ-2026-0001-parks", at: NOW, recorded_in: MINUTES },
    { ref: MINUTES, by_kind: "group", by: GROUP },
    { ref: MEMO, by_kind: "member", by: "bob", level: "cover", at: NOW, signature: accounts[1].signature_b64 },
    { ref: MEMO, by_kind: "group", by: GROUP },
    { ref: OBS, by_kind: "member", by: null, level: "group", at: NOW }];
  const doc = caseDocument({ pairs, findings, pins, materials, attestations, accounts, accepted, bar: opts.bar,
    recorded: opts.recorded ? opts.recorded(pairs) : null, facts: opts.signedFacts || facts, passages: opts.signedPassages || passages });
  put("case_document", null, doc);
  put("case_signature", null, sign(opts.caseSigner || "group", caseRatifyStatement(CASE, 2, sha(doc))));
  if (opts.mutate) opts.mutate(texts);
  return { texts, pairs, facts };
}

/** The manifest over the files (path order), with each part's fingerprint by `case-grammar`'s one spelling. */
export function manifestFor(listed, { keys = ["group", "alice", "bob"], over = {} } = {}) {
  const files = [...listed].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const parts = [...new Set(files.map((f) => f.part))].sort((a, b) => a - b).map((index) => {
    const mine = files.filter((f) => f.part === index);
    return { index, ...CG.casePartDigest(files, index) };
  });
  const doc = files.find((f) => f.kind === "case_document");
  return { format: "bio-case-file/1", group: GROUP, case: CASE, edition: 2, case_document_sha: doc ? doc.sha256 : null,
           keys: keys.map((k) => ({ key: keyFor(k).line, fingerprint: fingerprintOf(keyFor(k).b64) })), parts, files, ...over };
}

/** A case file's parts as bytes: the files split into `parts` parts (round robin by path), the complete edition rendered
 *  from the rest, every part carrying the same manifest. `edit(bytesByPath)` changes carried bytes after the manifest is
 *  written (a tampered file). */
export function caseFile(opts = {}) {
  const { texts, pairs, facts } = caseFiles(opts);
  const n = opts.parts || 1;
  const bytesOf = new Map([...texts].map(([p, t]) => [p, Buffer.from(t, "utf8")]));
  const listedOf = () => [...bytesOf.keys()].sort().map((path, i) => ({ path, sha256: sha(bytesOf.get(path)), bytes: bytesOf.get(path).length,
    part: (i % n) + 1, kind: CG.caseFileEntryOf(path).kind }));
  const pre = manifestFor(listedOf(), opts);
  const ce = CG.completeEditionOf({ format: pre.format, group: pre.group, case: pre.case, edition: pre.edition,
    case_document_sha: pre.case_document_sha, keys: pre.keys,
    files: listedOf().map((f) => ({ path: f.path, kind: f.kind, sha256: f.sha256, bytes: f.bytes, content: new Uint8Array(bytesOf.get(f.path)) })) });
  bytesOf.set(CG.caseFilePath("complete_edition"), Buffer.from(opts.completeEdition ?? ce, "utf8"));
  const listed = listedOf();
  const manifest = manifestFor(listed, opts);
  if (opts.manifest) opts.manifest(manifest);
  const carried = new Map(bytesOf);
  if (opts.edit) opts.edit(carried);
  const manifestBytes = Buffer.from(canonicalJson(manifest), "utf8");
  const parts = [];
  for (let i = 1; i <= n; i++) {
    const entries = [{ name: CG.CASE_FILE_MANIFEST_PATH, bytes: new Uint8Array(manifestBytes) },
      ...listed.filter((f) => f.part === i && carried.has(f.path)).map((f) => ({ name: f.path, bytes: new Uint8Array(carried.get(f.path)) }))];
    const z = serialiseContainer(entries);
    if (!z.ok) throw new Error(`fixture: ${z.reason}`);
    parts.push(z.bytes);
  }
  return { parts, manifest, pairs, facts, bytesOf };
}

export const byId = (answer) => Object.fromEntries(answer.findings.map((f) => [f.finding, f]));
