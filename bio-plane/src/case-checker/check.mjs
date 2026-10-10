/* case-checker — the one checker of a case file (requirements: `build/requirements/case-checker.md` R1–R12, R16–R18, R20, R22;
 * DEC-112 (3)(5)(6); `BIO_Publication_v0_1.md` §5C).
 *
 * `checkCaseFile({parts, documents?, keys?, lens?})` reads a case file's parts and recreates each finding from what they carry:
 * the integrity of every part and file (R2), the signatures and attestations (R3), the passages (R4), each grade
 * recomputed at the stated method version (R5), the bar (R6), the publication checks (R7), presentability (R8),
 * completion by documents supplied later (R9), the complete edition (R10) and each calculation recomputed by
 * `calc-grammar`'s evaluator (R20), composed into one result per finding (R11); beside them, how the case uses the
 * standards it measures against, judged offline over a carried `criteria` file (R22, through R21); the account's sentences
 * judged against what they cite (R24, `./account.mjs`); and each finding's pair under the lens asked for (R23,
 * `./lens.mjs`). It is built only from
 * pure code: `case-grammar`'s format, `case-catalogue`'s case-document checks (`checks.mjs`), `strength`'s method
 * (`method.mjs`), `content`'s extent grammar, `signatures`' verifier, `calc-grammar`'s evaluator, `answers`' sentence
 * checks (`sentences.mjs`) and this module's R21,
 * so the standalone program (R13) is this file and those, bundled. It reads nothing but its arguments, writes nothing, makes
 * no request and never throws (R1, R16); it answers a promise because a signature is verified by WebCrypto.
 *
 * Recreating shows a case intact and consistent, never true (R12): no answer composes a case-level strength, a single
 * verdict or an endorsement. Pairs are per finding and per axis. No place is named in this module's text (R17). */

import { parseFrontmatter } from "../record-grammar/frontmatter.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { createSha256, b64ToBytes } from "../record-grammar/sha256.mjs";
import { GRADE_AXES } from "../record-grammar/grades.mjs";
import { verifySshsig, ratifyStatement, caseRatifyStatement, captureAccountStatement, NS_RATIFY, normalizeKey,
         parseSshsig } from "../sshsig.mjs";
import { contentIdFor, extentRelation } from "../content/extent.mjs";
import { recomputePair, GRADING_METHOD_VERSIONS } from "../strength/method.mjs";
import { checkCaseDocument } from "../case-catalogue/checks.mjs";
import { caseFileManifestCheck, caseFileEntryOf, casePartDigest, CASE_FILE_MANIFEST_PATH, methodOf, materialsOf,
         acceptedWorkOf, standingOf, completeEditionOf, gradingFactsOf, passagesOf, GRADING_FACT_FIELDS,
         PASSAGE_FIELDS, calculationsOf, calculationFileText, provOf, CASE_FILE_PROV_PATH, lensOf } from "../case-grammar/index.mjs";
import { evaluate, resultKey, METHOD as CALC_METHOD } from "../calc-grammar/index.mjs";
import { CATALOG_VERSION } from "../gate.mjs";
import { readStoredZip, asBytes } from "./zip.mjs";
import { checkStandardsUse } from "./standards.mjs";
import { checkAccount, listOfField } from "./account.mjs";
import { LENS_LIMIT_STATEMENT, lensOfArg, applicationOf, pairsUnderLens } from "./lens.mjs";

/* ============================================================ the words (R1, R11, R18; the UX stream's, until it gives them) */

/** R1: the sentence every answer carries. The words are the UX stream's; until it gives them, this plain sentence. */
export const RECREATION_STATEMENT = "Recreating a case shows that what it carries is intact and consistent with what "
  + "it states. It does not show that the case is true, and it is not an endorsement of it.";
/** R18: the sentence beside the findings another group published that a finding rests on. The UX stream's words, later. */
export const REST_ON_ANOTHER_GROUP_STATEMENT = "Part of this case rests on another group's published finding. That part "
  + "is checked against that group's own case file, named here, and not on that group's behalf here.";
/** R3: the sentence an answer carries when no published keys were given. */
export const KEYS_NOT_CHECKED_STATEMENT = "The signing keys were not checked against the group's published list of "
  + "keys, because no list was given to this check.";
/** R7: the sentence when the stated catalogue version is not this checker's. */
export const CHECKS_VERSION_STATEMENT = (stated, own) => `The publication checks ran at this checker's version, ${own}, `
  + `not at the version the case states, ${stated === null ? "none" : stated}.`;

/** R20 (K1448): the sentence beside a calculation this checker does not recompute (a workbook, or a value from a third
 *  party's engine). The UX stream's words, later. */
export const NOT_RECOMPUTED_STATEMENT = "This value was recomputed by the publishing copy's engine, not by this checker, "
  + "so it is not shown here to agree.";
/** R20: the three answers for a calculation. */
export const CALCULATION_RESULTS = Object.freeze(["agrees", "differs", "not_recomputed"]);

/** R1: the three results. */
export const RESULTS = Object.freeze(["recreated", "recreated_in_part", "did_not_recreate"]);
/** R13: each result in words, as the standalone program prints it. The UX stream's words, when it gives them. */
export const RESULT_WORDS = Object.freeze({ recreated: "Recreated", recreated_in_part: "Recreated in part",
                                            did_not_recreate: "Did not recreate" });
/** R1: the checker's versions, stated in every answer. */
export const CHECKER_VERSIONS = Object.freeze({ grading_versions: [...GRADING_METHOD_VERSIONS], checks_version: CATALOG_VERSION,
                                                calc_versions: [CALC_METHOD] });
const versionsOut = () => ({ ...CHECKER_VERSIONS, grading_versions: [...CHECKER_VERSIONS.grading_versions],
                             calc_versions: [...CHECKER_VERSIONS.calc_versions] });

/* R3: the account statement a capturing member signs is `signatures.captureAccountStatement` (its R41), the one
   spelling `capture` signs and checks too (N530); it is pure, so the standalone program carries it. Stated in this
   module's readable specification (R14). `accountStatement` is that very function, kept under its earlier name. */
export const accountStatement = captureAccountStatement;
const te = new TextEncoder();
const td = new TextDecoder("utf-8", { fatal: false });

/* ============================================================ small pure helpers */

const HEX64 = /^[0-9a-f]{64}$/;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v) => (typeof v === "string" ? v : null);
const shaOf = (bytes) => createSha256().update(bytes).hex();
const textOf = (bytes) => (bytes ? td.decode(bytes) : null);
const jsonOf = (bytes) => { try { return bytes ? JSON.parse(td.decode(bytes)) : null; } catch { return undefined; } };
const b64 = (bytes) => {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += A[(n >> 18) & 63] + A[(n >> 12) & 63] + (i + 1 < bytes.length ? A[(n >> 6) & 63] : "=") + (i + 2 < bytes.length ? A[n & 63] : "=");
  }
  return out;
};

/** An entry of `missing[]` or `differs[]` (R11): which check, what it is about, and a sentence a reader can act on. */
const entry = (check, about, detail, more = {}) => ({ check, about, ...more, detail });

/* ============================================================ the case file read (R1, R2, R9) */

/** The SSH fingerprint of a wire key (`SHA256:` and the unpadded base64 of its digest), as `ssh-keygen -l` prints it. */
export function keyFingerprint(keyB64) {
  try { return "SHA256:" + b64(asBytes(hexBytes(shaOf(b64ToBytes(keyB64))))).replace(/=+$/, ""); } catch { return null; }
}
function hexBytes(hex) { const o = new Uint8Array(hex.length / 2); for (let i = 0; i < o.length; i++) o[i] = parseInt(hex.slice(2 * i, 2 * i + 2), 16); return o; }

const entryOf = (path) => { const e = caseFileEntryOf(path); return isObj(e) ? e : null; };
const departureWords = (d) => (typeof d === "string" ? d : isObj(d) && (d.detail || d.message)
  ? `${d.at ? `${d.at}: ` : ""}${String(d.detail || d.message)}` : canonicalJson(d));

/** R19: the one reader of a case file. `parts` are the parts' bytes (`public-read` R6's stored ZIPs). Answers
 *  `{manifest, files: [{path, kind, sha256, bytes, content, state, part, finding, ref}], departures}`: `manifest` the
 *  parsed manifest (the same in every part), or null; each file the manifest lists, `content` its bytes when it is
 *  carried and matches its row, else null, and `state` one of `intact`, `missing` or `differs` (`finding` and `ref` read
 *  from its path by `case-grammar`'s `caseFileEntryOf`); `departures` every way the parts depart from `case-grammar`
 *  R13, each a sentence. Pure; never throws. */
export function readCaseFile(parts) {
  try { return readParts(parts); }
  catch (e) { return { manifest: null, files: [], departures: [`the case file could not be read: ${String(e && e.message ? e.message : e).slice(0, 200)}`], parts: [] }; }
}

function readParts(parts) {
  const departures = [];
  const list = Array.isArray(parts) ? parts : [];
  if (!list.length) departures.push("no part of a case file was given");
  const zips = [];
  list.forEach((p, i) => {
    const z = readStoredZip(p);
    if (!z.ok) { departures.push(`part ${i + 1} given: ${z.problem}`); return; }
    for (const pr of z.problems) departures.push(`part ${i + 1} given: ${pr}`);
    zips.push({ given: i + 1, entries: z.entries });
  });
  const mpath = CASE_FILE_MANIFEST_PATH;
  let manifestText = null;
  for (const z of zips) {
    const mb = z.entries.get(mpath);
    if (!mb) { departures.push(`part ${z.given} given carries no ${mpath} at its root`); continue; }
    const t = textOf(mb);
    if (manifestText === null) manifestText = t;
    else if (t !== manifestText) departures.push(`part ${z.given} given carries a manifest that differs from the first part's`);
  }
  let manifest = null;
  if (manifestText !== null) {
    try { manifest = JSON.parse(manifestText); } catch { departures.push("the manifest is not JSON"); }
    if (manifest !== null && !isObj(manifest)) { departures.push("the manifest is not a JSON object"); manifest = null; }
  }
  const manifestAt = departures.length;     /* the manifest's own departures are named here, once the files are read */
  const m = manifest || {};
  const listedParts = Array.isArray(m.parts) ? m.parts.filter(isObj) : [];
  const files = (Array.isArray(m.files) ? m.files.filter(isObj) : []).map((f) => {
    const e = entryOf(f.path) || {};
    return { path: str(f.path) || "", kind: str(f.kind) || "", sha256: str(f.sha256) || "",
             bytes: Number.isSafeInteger(f.bytes) ? f.bytes : null, content: null, state: "missing",
             part: Number.isSafeInteger(f.part) ? f.part : null, finding: str(e.finding), ref: str(e.ref),
             calc: str(e.calc), input: str(e.input), detail: null };
  });
  /* Which given ZIP is which listed part: the one carrying every file the manifest puts in it. */
  const partOf = new Map();
  for (const lp of listedParts) {
    const rows = files.filter((f) => f.part === lp.index);
    const z = zips.find((zz) => rows.length > 0 && rows.every((f) => zz.entries.has(f.path)) && ![...partOf.values()].includes(zz))
      || zips.find((zz) => rows.some((f) => zz.entries.has(f.path)) && ![...partOf.values()].includes(zz));
    if (z) partOf.set(lp.index, z);
  }
  const partStates = listedParts.map((lp) => {
    const z = partOf.get(lp.index);
    const rows = files.filter((f) => f.part === lp.index);
    if (!z) return { index: lp.index, sha256: str(lp.sha256), state: "missing" };
    if (!rows.every((f) => z.entries.has(f.path))) return { index: lp.index, sha256: str(lp.sha256), state: "incomplete" };
    const carried = rows.map((f) => { const b = z.entries.get(f.path); return { path: f.path, sha256: shaOf(b), bytes: b.length, part: lp.index }; });
    const d = casePartDigest(carried, lp.index);
    const ok = d.sha256 === lp.sha256 && d.bytes === lp.bytes;
    return { index: lp.index, sha256: str(lp.sha256), state: ok ? "intact" : "differs" };
  });
  for (const f of files) {
    const z = f.part !== null ? partOf.get(f.part) : null;
    const b = z ? z.entries.get(f.path) : null;
    if (!b) continue;
    const sha = shaOf(b);
    if (sha !== f.sha256 || b.length !== f.bytes) {
      f.state = "differs";
      f.detail = `${f.path} does not match the manifest: it has SHA-256 ${sha} and ${b.length} bytes, where the manifest lists ${f.sha256} and ${f.bytes} bytes`;
    } else { f.state = "intact"; f.content = b; }
  }
  /* A part whose files differ is answered by those files' own entries, for the findings that need them; only a part
     whose every file matches its row and still does not recompute its listed fingerprint departs as a whole. */
  for (const ps of partStates) if (ps.state === "differs" && files.filter((f) => f.part === ps.index).every((f) => f.state === "intact"))
    departures.push(`part ${ps.index}'s files do not recompute the fingerprint the manifest lists for it (${ps.sha256})`);
  const listedNames = new Set(files.map((f) => f.path));
  for (const z of zips) for (const name of z.entries.keys())
    if (name !== mpath && !listedNames.has(name)) departures.push(`part ${z.given} given carries ${name}, which the manifest does not list`);
  /* `case-grammar` R13: the manifest's departures, those relative to the case document's `materials:` rows (an
     `obscured` copy and its row) among them when the case document is carried as the manifest lists it. */
  if (manifest) {
    const named = caseFileManifestCheck(manifest, { materials: carriedMaterials(files) });
    departures.splice(manifestAt, 0, ...(Array.isArray(named) ? named : []).map(departureWords));
  }
  return { manifest, files, departures, parts: partStates };
}

/* The case document's `materials:` rows (`case-grammar` R12), read from the carried case document when it is the bytes
   the manifest lists; null otherwise, so only what the manifest alone shows is checked. */
function carriedMaterials(files) {
  const doc = files.find((f) => f.kind === "case_document" && f.content);
  if (!doc) return null;
  const p = parseFrontmatter(textOf(doc.content));
  const read = isObj(p.data) ? materialsOf(p.data) : null;
  return isObj(read) && Array.isArray(read.materials) ? read.materials.filter(isObj) : null;
}

/** R8 (`case-grammar` R12's `obscured`): the copy a material row travels as, `{copy, label}`, or null. */
const obscuredOf = (mat) => (isObj(mat) && isObj(mat.obscured) && typeof mat.obscured.copy === "string" ? mat.obscured : null);

/* ============================================================ the chain a finding rests on */

/* One finding's grading facts, as `strength` R35 answers them and R32 reads them: `{legs, levels?}`. */
/* Two lists of rows say the same: each row's `fields` (but `finding` and `ord`, which the file's place states), a field
   absent read as null and a list or map field as its value, compared as canonical JSON. */
const rowsKey = (list, fields) => canonicalJson(list.map((r) => {
  const x = factFields(isObj(r) ? r : {});
  return Object.fromEntries(fields.filter((f) => f !== "finding" && f !== "ord").map((f) => [f, x[f] === undefined ? null : x[f]]));
}));
const sameRows = (a, b, fields) => rowsKey(a, fields) === rowsKey(b, fields);
/* A leg's list and map fields, carried in the document's flat rows as canonical JSON in one value (`case-grammar` R17),
   read back as values; a field already a value is kept. */
const factFields = (leg) => {
  if (!isObj(leg)) return leg;
  const out = { ...leg };
  for (const k of ["answer", "origins", "captures", "another_groups", "extent", "chain"])
    if (typeof out[k] === "string" && /^[[{]/.test(out[k])) { try { out[k] = JSON.parse(out[k]); } catch { /* kept as given */ } }
  return out;
};

/* ============================================================ the passages (R4) */

/** R4: the text at an extent of a document's carried extracted text. The extracted text is `case-grammar`'s one
 *  spelling (its R17, `extractedTextOf`): the canonical JSON of the reading's units, each `{extent, ref, text}`. The text
 *  at an extent is every unit's text whose extent overlaps it by `content.extentRelation` (the same place, one inside
 *  the other), in the units' order; null when no unit does or the text is not that spelling. */
export function textAtExtent(extracted, extent) {
  let units;
  try { units = JSON.parse(extracted); } catch { return null; }
  if (!Array.isArray(units)) return null;
  const e = isObj(extent) ? extent : { kind: "document" };
  const hit = units.filter((u) => isObj(u) && typeof u.text === "string" && isObj(u.extent)
    && ["same", "narrower", "wider"].includes(extentRelation(u.extent, e)));
  return hit.length ? hit.map((u) => u.text).join("\n") : null;
}
const squash = (s) => String(s).replace(/\s+/g, " ").trim();

/* ============================================================ the answer */

/** R1: check a case file. Never throws; answers the whole answer, a malformed input included. */
export async function checkCaseFile(args) {
  try { return await check(isObj(args) ? args : {}); }
  catch (e) {
    return malformed([`the check could not read this input: ${String(e && e.message ? e.message : e).slice(0, 200)}`], null);
  }
}

/* R1: malformed input names each departure, and every finding it can name does not recreate. */
function malformed(departures, manifest) {
  const m = isObj(manifest) ? manifest : {};
  const members = Array.isArray(m.files) ? [...new Set(m.files.filter((f) => isObj(f) && f.kind === "finding" && typeof f.finding === "string").map((f) => f.finding))] : [];
  return {
    format: str(m.format), case: str(m.case), edition: Number.isInteger(m.edition) ? m.edition : null, group: str(m.group),
    checker: versionsOut(),
    integrity: { intact: false, departures, parts: [], files: [], documents: { used: [], unmatched: [], wanted: [] } },
    signatures: { case: null, findings: [], attestations: [], keys_checked: false, keys_statement: KEYS_NOT_CHECKED_STATEMENT },
    publication_checks: { ran: false, findings: [], unasked: [], stated_version: null, checker_version: CATALOG_VERSION, statement: null },
    calculations: [], standards_use: null, obscured: [], account: null,
    lens: { name: "as_published", statements: null, departure: null, not_applied: [] }, lens_statement: LENS_LIMIT_STATEMENT,
    findings: members.map((f) => ({ finding: f, role: null, result: "did_not_recreate", missing: [],
      differs: departures.map((d) => entry("integrity", "case file", d)), pair: null, bar_met: null })),
    complete_edition: { equal: null, detail: "the case file could not be read, so its complete edition was not compared" },
    rests_on_another_group: [], rests_on_another_group_statement: REST_ON_ANOTHER_GROUP_STATEMENT,
    statement: RECREATION_STATEMENT,
  };
}

async function check({ parts, documents = [], keys = null, lens: lensArg = undefined }) {
  const lens = lensOfArg(lensArg);
  const parentDiffers = {};    // finding → entries from the findings it rests on (R5)
  const read = readCaseFile(parts);
  if (!read.manifest) return malformed(read.departures, read.manifest);
  const m = read.manifest;
  const files = read.files;
  const caseLevel = { missing: [], differs: [] };
  for (const d of read.departures) caseLevel.differs.push(entry("integrity", "case file", d));
  for (const f of files) if (f.state === "differs") f.entry = entry("integrity", f.path, f.detail, { sha256: f.sha256 });

  /* R9: bytes supplied later fill a gap when their SHA-256 is a missing file's recorded fingerprint, or a calculation
     input's stated SHA-256 that the case file lacks (R20 settles that below, so which documents were used is answered
     after the calculations). */
  const supplied = [];
  for (const d of Array.isArray(documents) ? documents : []) {
    const b = asBytes(d);
    if (!b) { supplied.push({ sha: null, bytes: null, used: false }); continue; }
    const doc = { sha: shaOf(b), bytes: b, used: false };
    supplied.push(doc);
    for (const g of files.filter((f) => f.state === "missing" && f.sha256 === doc.sha)) { g.state = "supplied"; g.content = b; doc.used = true; }
  }
  const fileOf = (kind, key, value) => files.find((f) => f.kind === kind && (key === null || f[key] === value)) || null;
  const filesOf = (kind) => files.filter((f) => f.kind === kind);

  /* The case document and its front matter. */
  const docFile = fileOf("case_document", null);
  const docText = docFile && docFile.content ? textOf(docFile.content) : null;
  let fm = null, body = null;
  if (docText !== null) {
    const p = parseFrontmatter(docText);
    fm = isObj(p.data) ? p.data : null;
    body = typeof p.body === "string" ? p.body : null;
    if (!fm) caseLevel.differs.push(entry("integrity", docFile.path, "the case document carries no front matter this checker can read"));
  }
  const docSha = docFile && docFile.content ? docFile.sha256 : null;
  if (!docFile) caseLevel.differs.push(entry("integrity", "case document", "the manifest lists no case document"));
  else if (docFile.state === "missing") caseLevel.missing.push(entry("integrity", docFile.path, `the case document is not carried; fetch the file whose SHA-256 is ${docFile.sha256}`, { sha256: docFile.sha256 }));
  else if (docFile.entry) caseLevel.differs.push(docFile.entry);
  if (docSha && str(m.case_document_sha) && docSha !== m.case_document_sha)
    caseLevel.differs.push(entry("integrity", "case document", `the case document's SHA-256 is ${docSha}, where the manifest names ${m.case_document_sha}`));
  if (fm && str(m.case) && fm.case_id !== m.case)
    caseLevel.differs.push(entry("integrity", "case document", `the case document names case ${fm.case_id}, where the manifest names ${m.case}`));
  if (fm && Number.isInteger(m.edition) && fm.case_edition !== m.edition)
    caseLevel.differs.push(entry("integrity", "case document", `the case document names edition ${fm.case_edition}, where the manifest names ${m.edition}`));

  const method = fm ? methodOf(fm) : null;
  const materialsRead = fm ? materialsOf(fm) : null;
  const materials = isObj(materialsRead) && Array.isArray(materialsRead.materials) ? materialsRead.materials.filter(isObj) : [];
  const attestations = isObj(materialsRead) && Array.isArray(materialsRead.attestations) ? materialsRead.attestations.filter(isObj) : [];
  const accepted = fm ? acceptedWorkOf(fm) : null;
  const acceptedRows = isObj(accepted) && Array.isArray(accepted.rows) ? accepted.rows.filter(isObj) : [];
  /* R5 (strength R29, R34): the attribution level in force for each observation or attested capture, as the signed
     document states it (`observation_attributions:`, `case-grammar` R2). */
  const levels = {};
  for (const r of fm && Array.isArray(fm.observation_attributions) ? fm.observation_attributions.filter(isObj) : []) {
    const k = str(r.observation) || str(r.capture);
    if (k && typeof r.level === "string") levels[k] = r.level;
  }

  /* The roster and its roles, as the signed document states them. */
  const roster = fm && Array.isArray(fm.case_findings) ? fm.case_findings.map(String) : [];
  const roleRows = fm && Array.isArray(fm.case_roles) ? fm.case_roles.filter(isObj) : [];
  const roleOf = new Map(roleRows.map((r) => [String(r.target ?? ""), r]));

  /* ---------------------------------------------------------- R3: signatures */
  const manifestKeys = (Array.isArray(m.keys) ? m.keys : []).filter(isObj).map((k) => ({ key: normalizeKey(k.key), fingerprint: str(k.fingerprint) }));
  for (const k of manifestKeys) if (k.key && k.fingerprint && keyFingerprint(k.key) !== k.fingerprint)
    caseLevel.differs.push(entry("signature", "signing keys", `the case file lists a key whose fingerprint is ${keyFingerprint(k.key)}, beside the fingerprint ${k.fingerprint}`));
  const allowed = manifestKeys.map((k) => k.key).filter(Boolean);
  const published = Array.isArray(keys) ? keys.map((k) => normalizeKey(isObj(k) ? k.key : k)).filter(Boolean) : null;
  const keyFacts = (keyB64) => ({ key_fingerprint: keyB64 ? keyFingerprint(keyB64) : null,
    listed_in_case_file: keyB64 ? allowed.includes(keyB64) : null,
    ...(published ? { among_published_keys: keyB64 ? published.includes(keyB64) : null } : {}) });
  const embedded = (armored) => { try { return parseSshsig(armored).pubB64; } catch { return null; } };
  const sigWords = (v) => (v.ok ? "verifies" : v.reason === "UNKNOWN_KEY" ? "was made with a key the case file does not list"
    : v.reason === "BAD_SIGNATURE" ? "does not verify over what it signs" : v.reason === "NAMESPACE" ? "was made for another purpose"
    : "cannot be read as a signature");
  async function verifyOver(armored, message) {
    const v = await verifySshsig(armored, message, NS_RATIFY, allowed);
    const key = v.keyB64 || embedded(armored);
    const pubOk = published && key ? published.includes(key) : true;
    return { verified: v.ok === true && pubOk, reason: v.ok ? (pubOk ? null : "NOT_PUBLISHED_KEY") : v.reason, ...keyFacts(key), words: sigWords(v) };
  }

  const sigCase = { file: null, verified: false, reason: null };
  const caseSig = fileOf("case_signature", null);
  if (!caseSig) caseLevel.differs.push(entry("signature", "case document", "the case file carries no signature of the case document, so nobody can be shown to have signed it"));
  else if (!caseSig.content) {
    if (caseSig.state === "missing") caseLevel.missing.push(entry("signature", caseSig.path, `the case document's signature is not carried; fetch the file whose SHA-256 is ${caseSig.sha256}`, { sha256: caseSig.sha256 }));
    else caseLevel.differs.push(caseSig.entry);
  } else if (fm && docSha) {
    const v = await verifyOver(textOf(caseSig.content), caseRatifyStatement(fm.case_id, fm.case_edition, docSha));
    Object.assign(sigCase, { file: caseSig.path, ...v });
    if (!v.verified) caseLevel.differs.push(entry("signature", "case document",
      v.reason === "NOT_PUBLISHED_KEY" ? "the case document's signature was made with a key that is not among the group's published keys"
        : `the case document's signature ${v.words}`));
  }

  /* ---------------------------------------------------------- the findings and their chains */
  const findingIds = [];
  const addFinding = (id) => { if (id && !findingIds.includes(id)) findingIds.push(id); };
  for (const id of roster) addFinding(id);
  const facts = new Map();       // finding → grading facts, or undefined when unreadable
  const reachedBy = new Map();   // finding → [parent findings]
  const restsOn = [];
  const legAnswers = new Map();  // finding → [{from, answer}] (a leg's stated answer for a finding it rests on)
  /* The grading facts and passages the signed document states (`case-grammar` R17) are what recomputation reads; a
     finding's carried file (R13) must say the same, since only the document is signed. Without the blocks (a document
     that predates them), the files are read. */
  const signedFacts = fm ? gradingFactsOf(fm) : null;
  const signedPassages = fm ? passagesOf(fm) : null;
  const factsDiffer = new Set(), passagesDiffer = new Set();
  const listOf = (raw, key) => (Array.isArray(raw) ? raw : isObj(raw) && Array.isArray(raw[key]) ? raw[key] : null);
  for (let i = 0; i < findingIds.length; i++) {
    const id = findingIds[i];
    const gf = fileOf("grading_facts", "finding", id);
    const raw = gf && gf.content ? jsonOf(gf.content) : null;
    const fileLegs = raw === undefined ? undefined : raw === null ? null : listOf(raw, "legs") ?? undefined;
    let fx;
    if (signedFacts) {
      const docLegs = signedFacts[id] || [];
      fx = { legs: docLegs };
      if (Array.isArray(fileLegs) && !sameRows(fileLegs, docLegs, GRADING_FACT_FIELDS)) factsDiffer.add(id);
      if (fileLegs === undefined) factsDiffer.add(id);
    } else fx = fileLegs === undefined ? undefined : fileLegs === null ? null : { legs: fileLegs };
    facts.set(id, fx);
    for (const leg of fx ? fx.legs.filter(isObj) : []) {
      const target = str(leg.target);
      if (leg.kind === "inquiry" && target) {
        addFinding(target);
        reachedBy.set(target, [...(reachedBy.get(target) || []), id]);
        if (isObj(leg.answer)) legAnswers.set(target, [...(legAnswers.get(target) || []), { from: id, answer: leg.answer }]);
      }
    }
  }
  /* The materials a finding's chain reaches, through the findings it rests on (cycle-safe), and the imported legs. */
  const materialOfLeg = (leg) => materials.find((x) => x.ref === leg.target)
    || materials.find((x) => Array.isArray(leg.captures) && leg.captures.includes(x.sha)) || null;
  function chainOf(id, seen = new Set()) {
    if (seen.has(id)) return { mats: [], refs: [], unlisted: [], calcs: [] };
    seen.add(id);
    const out = { mats: [], refs: [], unlisted: [], calcs: [] };
    const fx = facts.get(id);
    for (const leg of fx ? fx.legs.filter(isObj) : []) {
      if (leg.kind === "imported") { out.refs.push({ from: id, leg }); continue; }   /* R18: not followed past */
      if (leg.kind === "inquiry") { const c = chainOf(String(leg.target ?? ""), seen); out.mats.push(...c.mats); out.refs.push(...c.refs); out.unlisted.push(...c.unlisted); out.calcs.push(...c.calcs); continue; }
      if (leg.kind === "calculation") { const t = String(leg.target ?? ""); if (!out.calcs.includes(t)) out.calcs.push(t); continue; }   /* R20 */
      if (leg.kind === "document" || leg.kind === "observation") {
        const mat = materialOfLeg(leg);
        if (mat) { if (!out.mats.includes(mat)) out.mats.push(mat); }
        else out.unlisted.push({ from: id, target: String(leg.target ?? ""), kind: leg.kind });
      }
    }
    return out;
  }

  /* ---------------------------------------------------------- R3: the attestations, by kind */
  const accountRows = fm && Array.isArray(fm.capture_accounts) ? fm.capture_accounts.filter(isObj) : [];
  const attestationAnswers = [];
  const attestationFails = new Map();   // material ref → [entry]
  const attestationGaps = new Map();
  for (const row of attestations) {
    const ref = str(row.ref) || "";
    const mat = materials.find((x) => x.ref === ref) || null;
    const a = { ref, by_kind: str(row.by_kind), by: row.level === "group" || row.level === "project" ? null : str(row.by), state: "checked", detail: null };
    const fail = (detail) => { a.state = "fails"; a.detail = detail; attestationFails.set(ref, [...(attestationFails.get(ref) || []), entry("signature", ref, detail)]); };
    const gap = (detail) => { a.state = "not_carried"; a.detail = detail; attestationGaps.set(ref, [...(attestationGaps.get(ref) || []), entry("signature", ref, detail)]); };
    if (!mat) fail(`an attestation names material ${ref}, which the case document's materials do not list`);
    else if (row.by_kind === "member") {
      if (row.signature == null || row.signature === "") { a.state = "unsigned"; a.detail = "this member's attestation carries no signature at the attribution level in force, so none is checked"; }
      else {
        const acct = accountRows.find((x) => String(x.capture ?? "") === mat.sha && String(x.by ?? "") === String(row.by ?? ""));
        let text = null, armored = String(row.signature);
        try { if (acct && typeof acct.text_b64 === "string") text = td.decode(b64ToBytes(acct.text_b64)); } catch { text = null; }
        try { if (!/BEGIN SSH SIGNATURE/.test(armored)) armored = td.decode(b64ToBytes(armored)); } catch { /* left as given */ }
        if (text === null) gap(`the signed account attesting ${ref} is not carried, so its signature cannot be checked`);
        else {
          const v = await verifyOver(armored, captureAccountStatement(mat.sha, text));
          Object.assign(a, { key_fingerprint: v.key_fingerprint, listed_in_case_file: v.listed_in_case_file,
            ...(published ? { among_published_keys: v.among_published_keys } : {}) });
          if (!v.verified) fail(`the member's signed account attesting ${ref} ${v.reason === "NOT_PUBLISHED_KEY" ? "was made with a key that is not among the group's published keys" : v.words}`);
        }
      }
    } else if (row.by_kind === "group") {
      if (row.signature !== "case") fail(`a group attestation of ${ref} names a signature other than the case document's own`);
      else if (caseSig && !caseSig.content && caseSig.state === "missing") gap(`the group's attestation of ${ref} is the case document's signature, which is not carried`);
      else if (!sigCase.verified) fail(`the group's attestation of ${ref} is the case document's signature, which ${caseSig ? "does not verify" : "the case file does not carry"}`);
    } else if (row.by_kind === "project" || row.by_kind === "co_attestation") {
      const carried = mat.included !== true || files.some((f) => f.ref === ref);
      if (!carried) fail(`a ${row.by_kind === "project" ? "project" : "co-"}attestation names ${ref}, which the case file's manifest does not list`);
    } else fail(`an attestation of ${ref} names a kind this checker does not know (${String(row.by_kind)})`);
    attestationAnswers.push(a);
  }

  /* ---------------------------------------------------------- R7: the publication checks */
  const memberBasis = {};
  let basisAll = true;
  for (const id of roster) {
    const ff = fileOf("finding", "finding", id);
    const t = ff && ff.content ? textOf(ff.content) : null;
    const p = t !== null ? parseFrontmatter(t) : null;
    if (p && isObj(p.data) && Array.isArray(p.data.basis)) memberBasis[id] = p.data.basis; else basisAll = false;
  }
  const statedChecks = method && typeof method.checks === "string" ? method.checks : null;
  const pubFindings = fm ? checkCaseDocument(fm, { caseId: fm.case_id, edition: fm.case_edition, body, memberBasis }) : [];
  const unasked = ["C-21.1: the comparison with the case's previous edition, which this case file does not carry"];
  if (!basisAll) unasked.push("C-2.8's testimony-row and per-ground arms for each member whose basis the case file does not carry");
  const publication_checks = { ran: !!fm, findings: pubFindings, unasked, stated_version: statedChecks, checker_version: CATALOG_VERSION,
    statement: statedChecks === CATALOG_VERSION ? null : CHECKS_VERSION_STATEMENT(statedChecks, CATALOG_VERSION) };
  for (const x of pubFindings) if (x && x.severity === "error")
    caseLevel.differs.push(entry("publication", "case document", `the case does not pass publication check ${x.check}: ${x.message}`));

  /* ---------------------------------------------------------- R10: the complete edition */
  const ceFile = fileOf("complete_edition", null);
  const complete_edition = { equal: null, sha256: ceFile ? ceFile.sha256 : null, rendered_sha256: null, detail: null };
  if (!ceFile) { complete_edition.equal = false; complete_edition.detail = "the case file carries no complete edition"; caseLevel.differs.push(entry("complete_edition", "complete edition", complete_edition.detail)); }
  else if (!ceFile.content) {
    complete_edition.detail = ceFile.state === "missing" ? `the complete edition is not carried; fetch the file whose SHA-256 is ${ceFile.sha256}` : ceFile.detail;
    (ceFile.state === "missing" ? caseLevel.missing : caseLevel.differs).push(entry("complete_edition", ceFile.path, complete_edition.detail, { sha256: ceFile.sha256 }));
  } else if (files.some((f) => f.kind !== "complete_edition" && f.kind !== "criteria" && f.state !== "intact" && f.state !== "supplied")) {
    /* Rendered from files that are missing or differ, it could not be the carried edition; what they lack is already
       entered for each finding that needs them, so the edition is not compared rather than counted against every one.
       The criteria file is not rendered from (`case-grammar` R14), so it does not hold the comparison back (R22). */
    complete_edition.detail = "the complete edition was not compared, because files it is rendered from are missing or "
      + "differ from the manifest";
  } else {
    const caseFile = { format: m.format, group: m.group, case: m.case, edition: m.edition, case_document_sha: m.case_document_sha,
      keys: m.keys,
      files: files.filter((f) => f.content && f.kind !== "complete_edition")
        .map((f) => ({ path: f.path, kind: f.kind, sha256: f.sha256, bytes: f.bytes, content: f.content })) };
    const rendered = completeEditionOf(caseFile);
    const rb = typeof rendered === "string" ? te.encode(rendered) : asBytes(rendered && rendered.bytes !== undefined ? rendered.bytes : rendered);
    if (!rb) { complete_edition.detail = "this checker could not render the complete edition from the case file"; caseLevel.differs.push(entry("complete_edition", ceFile.path, complete_edition.detail)); }
    else {
      complete_edition.rendered_sha256 = shaOf(rb);
      complete_edition.equal = complete_edition.rendered_sha256 === shaOf(ceFile.content);
      complete_edition.detail = complete_edition.equal ? "the carried complete edition is the edition the rest of the case file renders"
        : `the carried complete edition (SHA-256 ${complete_edition.sha256}) is not the edition the rest of the case file renders (SHA-256 ${complete_edition.rendered_sha256})`;
      if (!complete_edition.equal) caseLevel.differs.push(entry("complete_edition", ceFile.path, complete_edition.detail));
    }
  }

  /* ---------------------------------------------------------- R20: the calculations */
  const calculations = fm ? recomputeCalculations(fm, files, supplied) : [];
  const used = [], unmatched = [];
  for (const doc of supplied) {
    if (doc.sha === null) unmatched.push({ sha256: null, bytes: null, detail: "a supplied document is not bytes, so it was not used" });
    else if (!doc.used) unmatched.push({ sha256: doc.sha, bytes: doc.bytes.length, detail: `a supplied document (SHA-256 ${doc.sha}) matches no fingerprint this case file records as missing, and no calculation input it lacks, so it was not used` });
    else if (!used.includes(doc.sha)) used.push(doc.sha);
  }
  /* R9 (K2143): every file the manifest lists that the case file lacks (absent, or carried with other bytes) and no
     document supplied filled, in the manifest's order, so a reader knows each file to fetch; the criteria file (R22)
     among them, though no finding's result rests on it. */
  const wanted = files.filter((f) => (f.state === "missing" || f.state === "differs") && !used.includes(f.sha256))
    .map((f) => ({ path: f.path, kind: f.kind, sha256: f.sha256,
                   detail: `${f.state === "differs" ? `${f.path} is carried with other bytes` : `${f.path} is not carried`}; fetch the file whose SHA-256 is ${f.sha256}` }));
  /* R2, R20: the calculations' PROV-O rendering, when carried, is what `case-grammar` R19 renders from the signed rows. */
  const provFile = files.find((f) => f.path === CASE_FILE_PROV_PATH) || null;
  if (fm && provFile && provFile.content && textOf(provFile.content) !== provOf(calculationsOf(fm)))
    caseLevel.differs.push(entry("calculation", provFile.path, "the calculations' provenance file the case file carries is not the rendering of the calculations the signed case document states"));

  /* ---------------------------------------------------------- R22: how the case uses its standards, offline */
  const standards_use = standardsUseOf({ files, docText, materials, signedPassages, fileOf });

  /* ---------------------------------------------------------- R24: the account, offline */
  const account = fm ? accountUseOf({ fm, files, facts, materials, signedPassages, fileOf, caseLevel }) : null;

  /* ---------------------------------------------------------- per finding */
  const bar = fm && isObj(fm.required_strength) ? fm.required_strength : null;
  const version = method && typeof method.grading === "string" ? method.grading : null;
  const strengthRows = fm && Array.isArray(fm.case_strength) ? fm.case_strength.filter(isObj) : [];
  const findingSigs = [];
  const findingsOut = [];
  /* R5, R18: one finding's legs recomputed at the stated version, a leg on another group's finding taking the
     `accepted_work:` row's pair as its fact; answers recomputePair's answer with `pair` beside it. */
  function recomputeLegs(id, legs0) {
    const legs = legs0.map((leg) => {
      if (!isObj(leg) || leg.kind !== "imported") return leg;
      const row = acceptedRows.find((r) => r.ref === leg.target && (r.member === id || r.leg_of === id)) || acceptedRows.find((r) => r.ref === leg.target);
      return row && isObj(row.pair) ? { ...leg, answer: row.pair } : leg;    /* R18: the row's pair is that leg's fact */
    });
    const r = recomputePair({ legs: legs.map(factFields), levels: Object.keys(levels).length ? levels : null, version });
    return r.ok ? { ...r, pair: Object.fromEntries(GRADE_AXES.map((a) => [a, { state: r[a].state, grade: r[a].grade ?? null }])) } : r;
  }
  const fileGap = (f, about, what) => (f.state === "missing"
    ? { missing: entry("integrity", about, `${what} is not carried; fetch the file whose SHA-256 is ${f.sha256}`, { sha256: f.sha256 }) }
    : f.entry ? { differs: f.entry } : {});

  for (const id of findingIds) {
    const missing = [...caseLevel.missing], differs = [...caseLevel.differs];
    const put = (g) => { if (g.missing) missing.push(g.missing); if (g.differs) differs.push(g.differs); };
    const isMember = roster.includes(id);
    const role = isMember ? (str(roleOf.get(id)?.role) || null) : "reached";
    const ff = fileOf("finding", "finding", id);
    if (!ff) (isMember ? differs : missing).push(entry("integrity", id, `the case file carries no published bytes for finding ${id}`));
    else put(fileGap(ff, id, `finding ${id}'s published bytes`));

    /* R3: a member's signature, over its pinned version. */
    if (isMember) {
      const pin = str(roleOf.get(id)?.version_sha);
      const fs = fileOf("finding_signature", "finding", id);
      const sig = { finding: id, verified: false, reason: null };
      if (ff && ff.content && pin && shaOf(ff.content) !== pin)
        differs.push(entry("integrity", id, `finding ${id}'s carried bytes are not the version the case pins (${pin})`));
      if (!fs) differs.push(entry("signature", id, `the case file carries no signature for finding ${id}`));
      else if (!fs.content) put(fileGap(fs, id, `finding ${id}'s signature`));
      else if (pin) {
        const v = await verifyOver(textOf(fs.content), ratifyStatement(id, pin));
        Object.assign(sig, v); delete sig.words;
        if (!v.verified) differs.push(entry("signature", id, `finding ${id}'s signature ${v.reason === "NOT_PUBLISHED_KEY" ? "was made with a key that is not among the group's published keys" : v.words}`));
      }
      findingSigs.push(sig);
    }

    /* R4: the passages it relies on. */
    const pf = fileOf("passages", "finding", id);
    if (pf && !pf.content) put(fileGap(pf, id, `finding ${id}'s passages`));
    const fileRows = pf && pf.content ? listOf(jsonOf(pf.content), "passages") : pf ? [] : [];
    const rows = signedPassages ? (signedPassages[id] || []) : fileRows;
    if (signedPassages && pf && pf.content && (fileRows === null || !sameRows(fileRows, rows, PASSAGE_FIELDS)))
      differs.push(entry("passage", id, `finding ${id}'s carried passages are not the passages the signed case document states`));
    else if (rows === null) differs.push(entry("passage", id, `finding ${id}'s passages cannot be read`));
    for (const row of (rows || []).filter(isObj)) {
      const cap = str(row.capture_sha) || "";
      const mat = materials.find((x) => x.sha === cap) || null;
      const where = `a passage of ${cap || "an unnamed document"} relied on by ${id}`;
      if (!HEX64.test(String(row.content_id ?? "")) || contentIdFor(cap, row.extent, row.chain ?? null) !== row.content_id) {
        differs.push(entry("passage", id, `${where} does not recompute to the content id it states (${String(row.content_id)})`)); continue; }
      const tf = mat && mat.kind === "observation" ? fileOf("observation", "ref", mat.ref) : mat ? fileOf("extracted_text", "ref", mat.ref) : null;
      if (!tf || !tf.content) {
        missing.push(entry("passage", id, `${where} cannot be found, because the document's extracted text is not carried${mat ? `; fetch the document whose SHA-256 is ${mat.sha}${mat.origin ? `, from ${mat.origin}` : ""}${mat.archived_copy ? ` (archived at ${mat.archived_copy})` : ""}` : ""}`,
          { sha256: tf ? tf.sha256 : cap, ...(mat && mat.origin ? { origin: mat.origin } : {}) }));
        continue;
      }
      const at = mat.kind === "observation" ? textOf(tf.content) : textAtExtent(textOf(tf.content), row.extent);
      if (at === null || typeof row.quoted !== "string" || !squash(at).includes(squash(row.quoted)))
        differs.push(entry("passage", id, `${where} is not found where it is said to be: its quoted text is not in the document's text at that place`));
    }

    /* R5: the pair, recomputed at the stated version. */
    const fx = facts.get(id);
    const gf = fileOf("grading_facts", "finding", id);
    let pair = null;
    if (gf && gf.content && factsDiffer.has(id))
      differs.push(entry("grade", id, `finding ${id}'s carried grading facts are not the facts the signed case document states`));
    if (gf && !gf.content) put(fileGap(gf, id, `finding ${id}'s grading facts`));
    if (!fx && !gf) missing.push(entry("grade", id, `the case file carries no grading facts for finding ${id}, so its grade cannot be recomputed`));
    else if (!fx && gf && gf.content) differs.push(entry("grade", id, `finding ${id}'s grading facts cannot be read`));
    else if (!fx) { /* not carried: entered above */ }
    else {
      const r = recomputeLegs(id, fx.legs);
      if (!r.ok && r.reason === "UNKNOWN_METHOD_VERSION")
        missing.push(entry("grade", id, `the grade was set by grading method ${version === null ? "(none stated)" : version}, which this checker does not hold (it holds ${GRADING_METHOD_VERSIONS.join(", ")})`, { version }));
      else if (!r.ok) differs.push(entry("grade", id, `finding ${id}'s grade could not be recomputed: ${r.detail}`));
      else {
        pair = r.pair;
        const recorded = isMember
          ? [{ from: "the case document", rows: strengthRows.filter((x) => String(x.target ?? "") === id) }]
          : (legAnswers.get(id) || []).map((x) => ({ from: `the grading facts of ${x.from}`, rows: GRADE_AXES.filter((a) => isObj(x.answer[a])).map((a) => ({ axis: a, ...x.answer[a] })) }));
        if (isMember && !recorded[0].rows.length) differs.push(entry("grade", id, `the case document records no pair for finding ${id}`));
        for (const rec of recorded) for (const row of rec.rows) {
          const a = String(row.axis ?? "");
          if (!pair[a]) continue;
          const rg = row.grade ?? null, rs = String(row.state ?? "");
          if (rg !== pair[a].grade || (rs && rs !== pair[a].state)) {
            const d = entry("grade", id, `on ${a}, ${rec.from} records ${rg ?? rs} for finding ${id}, and it recomputes to ${pair[a].grade ?? pair[a].state}`, { axis: a, recorded: rg ?? rs, recomputed: pair[a].grade ?? pair[a].state });
            differs.push(d);
            if (!isMember) for (const parent of reachedBy.get(id) || []) (parentDiffers[parent] ||= []).push(entry("grade", parent, `${parent} rests on ${id}, whose stated grade on ${a} does not recompute`, { axis: a }));
          }
        }
      }
    }

    /* R6: the bar, by `case-grammar`'s one reading of a standing (its R15), over the recomputed pair (or, where it
       could not be recomputed, the recorded one). A finding reached through a member's chain is not asked. */
    let bar_met = "not_asked";
    if (isMember) {
      const p = pair || Object.fromEntries(GRADE_AXES.map((a) => {
        const row = strengthRows.find((x) => String(x.target ?? "") === id && x.axis === a);
        return [a, { state: row ? str(row.state) : null, grade: row ? row.grade ?? null : null }];
      }));
      const st = standingOf({ role, bar, pair: p });
      bar_met = isObj(st) ? st.meets : null;
      for (const a of isObj(st) && st.meets === false && Array.isArray(st.short) ? st.short : [])
        differs.push(entry("bar", id, `on ${a}, finding ${id} reaches ${p[a]?.grade ?? p[a]?.state ?? "nothing"}, short of the bar the case records (${st.bar[a]})`, { axis: a, bar: st.bar[a] }));
    }

    /* R8, R2, R3: the material its chain reaches. */
    const chain = chainOf(id);
    if (isMember && role === "load_bearing")
      for (const u of chain.unlisted) differs.push(entry("presentability", id, `${id}'s chain reaches ${u.kind} ${u.target}, which the case document's materials do not list`));
    for (const mat of chain.mats) {
      const what = `${mat.kind === "observation" ? "the observation" : "the document"} ${mat.ref}`;
      const lb = isMember && role === "load_bearing";
      /* R8 (DEC-180 (4)): a row carried as its copy is presentable when a file of kind `obscured` is carried at the copy's
         SHA-256 (R2 checks its bytes); its extracted text and the original's bytes are not asked: the original never
         travels. */
      const ob = obscuredOf(mat);
      if (ob) {
        const f = files.find((x) => x.kind === "obscured" && x.ref === mat.ref && x.sha256 === ob.copy) || null;
        if (f && f.entry) differs.push(f.entry);
        else if (!f || !f.content)
          missing.push(entry(lb ? "presentability" : "integrity", id, `the copy of ${what} carried in its place (a photo with its marked areas obscured, or a member document cleaned) is not carried; fetch the file whose SHA-256 is ${ob.copy}`, { sha256: ob.copy, copy: ob.copy }));
        for (const e of attestationFails.get(mat.ref) || []) differs.push({ ...e, about: id });
        for (const e of attestationGaps.get(mat.ref) || []) missing.push({ ...e, about: id });
        continue;
      }
      const fetch = `fetch the ${mat.kind === "observation" ? "observation" : "document"} whose SHA-256 is ${mat.sha}${mat.origin ? `, from ${mat.origin}` : ""}${mat.archived_copy ? ` (archived at ${mat.archived_copy})` : ""}`;
      const needs = mat.kind === "observation" ? [["observation", mat.sha]] : [["document", mat.sha], ["extracted_text", mat.text_sha]];
      if (lb && mat.included !== true)
        differs.push(entry("presentability", id, `${id} is load-bearing and rests on ${what}, which the case lists as not travelling whole`, { sha256: mat.sha }));
      for (const [kind, signedSha] of needs) {
        const f = fileOf(kind, "ref", mat.ref);
        if (f && f.content && signedSha && f.sha256 !== signedSha)
          differs.push(entry("integrity", id, `${kind === "extracted_text" ? `the carried extracted text of ${what}` : `the carried ${what.replace(/^the /, "")}`} is not the bytes the signed case fingerprints (${signedSha})`, { sha256: signedSha }));
        if (f && f.entry) differs.push(f.entry);
        else if ((!f || !f.content) && (mat.included === true || (f && f.state === "missing")))
          missing.push(entry(lb ? "presentability" : "integrity", id, `${what}${kind === "extracted_text" ? "'s extracted text" : ""} is not carried; ${fetch}`, { sha256: f ? f.sha256 : mat.sha, ...(mat.origin ? { origin: mat.origin } : {}) }));
      }
      for (const e of attestationFails.get(mat.ref) || []) differs.push({ ...e, about: id });
      for (const e of attestationGaps.get(mat.ref) || []) missing.push({ ...e, about: id });
    }
    /* R20, R11: a calculation its chain rests on gives it that calculation's entries. */
    for (const calc of chain.calcs) {
      const c = calculations.find((x) => x.calc === calc);
      if (!c) { differs.push(entry("calculation", id, `${id}'s chain rests on calculation ${calc}, which the case document's calculations do not list`)); continue; }
      for (const e of c.differs) differs.push({ ...e, about: id });
      for (const e of c.missing) missing.push({ ...e, about: id });
    }
    /* R18: another group's finding, recreated up to that leg. */
    for (const { leg } of chain.refs) {
      const row = acceptedRows.find((r) => r.ref === leg.target) || null;
      const it = row ? { group: str(row.group), case: str(row.case), edition: Number.isInteger(row.edition) ? row.edition : row.edition ?? null, finding: str(row.finding), manifest_sha: str(row.manifest_sha) }
        : { group: null, case: null, edition: null, finding: String(leg.target ?? ""), manifest_sha: null };
      if (!restsOn.some((x) => canonicalJson(x) === canonicalJson(it))) restsOn.push(it);
    }

    findingsOut.push({ finding: id, role, missing, differs, pair, bar_met });
  }
  /* A finding resting on one whose stated grade does not recompute differs too (R5). */
  for (const f of findingsOut) for (const e of parentDiffers[f.finding] || []) f.differs.push(e);
  for (const f of findingsOut) {
    f.missing = dedupe(f.missing); f.differs = dedupe(f.differs);
    f.result = f.differs.length ? "did_not_recreate" : f.missing.length ? "recreated_in_part" : "recreated";
  }

  /* R23: each finding's pair and bar under the lens asked for. A lens re-weighs; the result stays the check's. */
  const applications = fm && Array.isArray(fm.bias_applications) ? fm.bias_applications.map(applicationOf).filter(Boolean) : [];
  const lensAnswer = { name: lens.name, statements: lens.statements, departure: lens.departure, not_applied: [] };
  if (lens.name !== "as_published") {
    const readable = new Map([...facts].filter(([, fx]) => fx && Array.isArray(fx.legs)).map(([id, fx]) => [id, { legs: fx.legs.map(factFields) }]));
    const under = pairsUnderLens({ lens, facts: readable, published: applications, recompute: (legs) => recomputeLegs(null, legs) });
    lensAnswer.not_applied = under.not_applied;
    for (const f of findingsOut) {
      const p = under.pairs.get(f.finding) ?? null;
      const isMember = roster.includes(f.finding);
      const st = isMember && p ? standingOf({ role: f.role, bar, pair: p }) : null;
      f.as_published = { pair: f.pair, bar_met: f.bar_met };
      f.lens_changes = under.changes.get(f.finding) || [];
      f.pair = p;
      f.bar_met = !isMember ? "not_asked" : isObj(st) ? st.meets : null;
    }
  }

  return {
    format: str(m.format), case: str(m.case), edition: Number.isInteger(m.edition) ? m.edition : null, group: str(m.group),
    checker: versionsOut(),
    integrity: { intact: !read.departures.length && files.every((f) => f.state === "intact" || f.state === "supplied"),
      departures: read.departures, parts: read.parts,
      files: files.map((f) => ({ path: f.path, kind: f.kind, sha256: f.sha256, state: f.state })),
      documents: { used, unmatched, wanted } },
    signatures: { case: caseSig ? { file: caseSig.path, verified: sigCase.verified === true, reason: sigCase.reason ?? null,
        key_fingerprint: sigCase.key_fingerprint ?? null, listed_in_case_file: sigCase.listed_in_case_file ?? null,
        ...(published ? { among_published_keys: sigCase.among_published_keys ?? null } : {}) } : null,
      findings: findingSigs, attestations: attestationAnswers, keys_checked: !!published,
      keys_statement: published ? null : KEYS_NOT_CHECKED_STATEMENT },
    publication_checks,
    calculations,
    standards_use,
    obscured: materials.filter(obscuredOf).map((x) => ({ ref: str(x.ref), sha: str(x.sha), copy: x.obscured.copy, label: str(x.obscured.label) })),
    account,
    lens: lensAnswer, lens_statement: LENS_LIMIT_STATEMENT,
    findings: findingsOut.map((f) => ({ finding: f.finding, role: f.role, result: f.result, missing: f.missing, differs: f.differs, pair: f.pair, bar_met: f.bar_met,
      ...(lens.name !== "as_published" ? { as_published: f.as_published, lens_changes: f.lens_changes } : {}) })),
    complete_edition,
    rests_on_another_group: restsOn, rests_on_another_group_statement: REST_ON_ANOTHER_GROUP_STATEMENT,
    statement: RECREATION_STATEMENT,
  };
}
const dedupe = (list) => { const seen = new Set(); return list.filter((e) => { const k = canonicalJson(e); if (seen.has(k)) return false; seen.add(k); return true; }); };

/* ============================================================ standards' use, offline (R22) */

/** R22: the sentence beside a row frozen before T37, which carries no `captures` (`publication` R72), so whether its
 *  standard's whole text travels is not judged here; stated, never filled. The UX stream's words, later. */
export const CAPTURES_NOT_CARRIED_STATEMENT = "Whether this standard's whole text travels with the case is not judged "
  + "here, because its row was recorded before the case file said which captures hold its text.";

/** R22: R21 (`checkStandardsUse`) over the case document, the carried `criteria` file's rows, the document's
 *  `materials:` rows and its passages (each with the finding relying on it); null when the case file lists no
 *  `criteria` file. Each row carries `captures` as `publication` R72 froze them (only the captures the edition carries,
 *  T37), so `COPYRIGHTED_TEXT_CARRIED` and `COPYRIGHTED_PASSAGE_UNRELIED` are judged offline over them exactly as R21
 *  judges them at the ceremony. A row frozen before T37 carries no `captures`: for a judged row of a standard whose
 *  `access` is not `free`, `COPYRIGHTED_TEXT_CARRIED`, the check that needs them, is not judged for it and its standard
 *  is named in `unjudged` with that check. (`COPYRIGHTED_PASSAGE_UNRELIED` does not need them offline: its row's own
 *  passages are judged, and every passage a case file carries is a finding's, `case-grammar` R17.) A file listed but
 *  not carried, or carried with other bytes, is answered `{ok: null, detail}` naming the file to fetch. It changes no
 *  finding's result. Pure; never throws. */
function standardsUseOf({ files, docText, materials, signedPassages, fileOf }) {
  const f = fileOf("criteria", null);
  if (!f) return null;
  if (!f.content) return { ok: null, file: f.path, sha256: f.sha256,
    detail: f.state === "missing" ? `the criteria the case measures against are not carried; fetch the file whose SHA-256 is ${f.sha256}`
      : `the criteria the case measures against are not judged, because ${f.detail}` };
  if (docText === null) return { ok: null, file: f.path, sha256: f.sha256,
    detail: "the criteria the case measures against are not judged, because the case document is not carried" };
  const criteria = jsonOf(f.content);
  const passages = [];
  /* the passages the signed document states; a document that predates the block, the carried files (as R4 reads them) */
  const byFinding = isObj(signedPassages) ? Object.entries(signedPassages)
    : files.filter((x) => x.kind === "passages" && x.content && x.finding).map((x) => { const v = jsonOf(x.content); return [x.finding, Array.isArray(v) ? v : isObj(v) ? v.passages : null]; });
  for (const [finding, rows] of byFinding)
    for (const r of Array.isArray(rows) ? rows : []) if (isObj(r)) passages.push({ ...factFields(r), finding });
  const r = checkStandardsUse({ text: docText, criteria: criteria === undefined ? null : criteria, materials, passages });
  if (!Array.isArray(criteria) || r.refusals?.some((x) => x.code === "MALFORMED")) return r;
  const blind = criteria.filter((c) => c.stated !== "not held" && c.access !== "free" && !Array.isArray(c.captures))
    .map((c) => ({ standard: c.standard, portion: c.portion ?? null, body: c.body ?? null, check: "COPYRIGHTED_TEXT_CARRIED",
                   detail: CAPTURES_NOT_CARRIED_STATEMENT }));
  return blind.length ? { ...r, unjudged: [...(r.unjudged || []), ...blind] } : r;
}

/* ============================================================ the account, offline (R24) */

/** R24: the case document's `account:` block (`case-grammar` R23) judged by `checkAccount` over what the case file
 *  carries: each finding's signed conclusion (`case_conclusions:`, its claim, or what it says of an undetermined one),
 *  each leg (`<finding>#<ord>`: its target and ground, with its role), each passage (its `content_id`: its quoted text),
 *  each material carried (its `ref` and `sha`: its extracted text or observation), the statements its lens prints
 *  (`lens_statements:`, `case-grammar` R9) and the conclusions with their legs. A sentence citing material the case
 *  file lacks is not judged: it is named, and that is a `missing` entry for the case. Each departure is a `differs`
 *  entry for the case naming its code. Null for a document with no `account:` block. Pure; never throws. */
function accountUseOf({ fm, files, facts, materials, signedPassages, fileOf, caseLevel }) {
  if (!Array.isArray(fm.account)) return null;
  const rows = fm.account;
  const cited = [], lacking = new Set();
  const conclRows = Array.isArray(fm.case_conclusions) ? fm.case_conclusions.filter(isObj) : [];
  for (const c of conclRows) if (str(c.target))
    cited.push({ ref: c.target, text: String((c.claim_state === "adopted" ? c.claim : c.claim_detail ?? c.claim) ?? "") });
  const legsOf = (id) => { const fx = facts.get(id); return fx && Array.isArray(fx.legs) ? fx.legs.filter(isObj) : []; };
  for (const id of facts.keys()) legsOf(id).forEach((leg, k) => {
    const ord = Number.isInteger(leg.ord) ? leg.ord : k;
    cited.push({ ref: `${id}#${ord}`, text: [leg.target, leg.ground].filter((x) => typeof x === "string" && x).join(" "),
                 ...(typeof leg.role === "string" ? { role: leg.role } : {}) });
  });
  const passageRows = isObj(signedPassages) ? Object.values(signedPassages).flat()
    : files.filter((x) => x.kind === "passages" && x.content).flatMap((x) => { const v = jsonOf(x.content); return Array.isArray(v) ? v : isObj(v) && Array.isArray(v.passages) ? v.passages : []; });
  for (const p of passageRows.filter(isObj)) if (str(p.content_id)) cited.push({ ref: p.content_id, text: String(p.quoted ?? "") });
  for (const mat of materials) {
    const tf = mat.kind === "observation" ? fileOf("observation", "ref", mat.ref) : fileOf("extracted_text", "ref", mat.ref);
    let text = null;
    if (tf && tf.content) {
      if (mat.kind === "observation") text = textOf(tf.content);
      else { try { const u = JSON.parse(textOf(tf.content)); text = Array.isArray(u) ? u.filter(isObj).map((x) => String(x.text ?? "")).join("\n") : null; } catch { text = null; } }
    }
    for (const ref of [str(mat.ref), str(mat.sha)].filter(Boolean)) { if (text === null) lacking.add(ref); else cited.push({ ref, text }); }
  }
  const conclusions = conclRows.filter((c) => str(c.target)).map((c) => ({ finding: c.target, claim: str(c.claim), claim_state: str(c.claim_state),
    legs: legsOf(c.target).map((leg, k) => ({ ord: Number.isInteger(leg.ord) ? leg.ord : k, target: str(leg.target), role: str(leg.role) })) }));
  const lens = lensOf(fm);
  const printed = lens && Array.isArray(lens.statements) ? lens.statements.filter((x) => str(x.id)).map((x) => ({ bundle: x.bundle, id: x.id })) : [];
  const judged = [], not_judged = [];
  rows.forEach((r, i) => {
    const cites = isObj(r) ? listOfField(r.cites) : [];
    const gone = cites.filter((c) => lacking.has(c));
    if (gone.length) not_judged.push({ sentence: isObj(r) && Number.isInteger(r.ord) ? r.ord : i, cites: gone,
      detail: `account sentence ${isObj(r) && Number.isInteger(r.ord) ? r.ord : i} cites ${gone.join(", ")}, whose text this case file does not carry, so it is not judged; fetch it to judge it` });
    else judged.push(isObj(r) && !Number.isInteger(r.ord) ? { ...r, ord: i } : r);
  });
  const r = checkAccount({ account: judged, cited, printed, conclusions });
  for (const x of r.refusals || [])
    caseLevel.differs.push(x.code === "MALFORMED" ? entry("account", "account", `the case document's account cannot be read (${x.field})`, { code: x.code })
      : entry("account", `account sentence ${x.sentence}`, x.detail, { code: x.code }));
  for (const n of not_judged) caseLevel.missing.push(entry("account", `account sentence ${n.sentence}`, n.detail));
  return { sentences: rows.length, judged: judged.length, ok: r.ok === true && !not_judged.length ? true : r.ok === true ? null : false,
           refusals: r.refusals || [], not_judged };
}

/* ============================================================ the calculations (R20) */

const BIO_CALC = /^bio-calc\/\d+$/;

/** R20: each calculation recomputed by `calc-grammar.evaluate` over the inputs the case file carries, at the method version
 *  its row states. An input the case file lacks (absent, or carried with other bytes) is filled by a supplied document
 *  whose SHA-256 is the input's stated one (R9), which is then marked used and named in the answer's `supplied`.
 *  Answers `[{calc, result, differs[], missing[], supplied?, disclosed?, statement?}]`. Pure; never throws. */
function recomputeCalculations(fm, files, supplied = []) {
  const out = [];
  for (const row of calculationsOf(fm)) {
    const calc = str(row.calc) || String(row.calc ?? "");
    const differs = [], missing = [];
    const a = { calc, result: "agrees", differs, missing };
    const disclosed = row.disclosed != null && row.disclosed !== "" && (row.recompute === "differs" || row.recompute === "unbound")
      ? row.disclosed : null;
    if (disclosed !== null) a.disclosed = disclosed;
    const recipe = row.recipe;
    const version = str(row.method_version);
    const recipeMethod = isObj(recipe) ? str(recipe.method) : null;
    /* A workbook, or a value from another engine: recomputed by the publishing copy's engine, never shown to agree. */
    if (!isObj(recipe) || !BIO_CALC.test(recipeMethod || "") || (version !== null && !BIO_CALC.test(version))) {
      out.push({ ...a, result: "not_recomputed", statement: NOT_RECOMPUTED_STATEMENT });
      continue;
    }
    /* Each input's bytes: the carried file's when they are the bytes its hash names, else a supplied document's (R9). */
    const hashes = isObj(row.inputs) ? row.inputs : null;
    const inputBytes = {}, filled = [];
    for (const [name, sha] of Object.entries(hashes || {})) {
      const f = sha ? files.find((x) => x.kind === "calculation" && x.input === sha && x.calc === calc)
        || files.find((x) => x.kind === "calculation" && x.input === sha) : null;
      const b = f && f.content ? f.content : null;
      if (b && shaOf(b) === sha) {
        if (f.state === "supplied") filled.push({ input: name, sha256: sha });    /* a listed file a document filled above */
        inputBytes[name] = { bytes: b, file: f }; continue;
      }
      const doc = sha ? supplied.find((s) => s.sha === sha) : null;
      if (doc) { doc.used = true; filled.push({ input: name, sha256: sha }); inputBytes[name] = { bytes: doc.bytes, file: f }; }
      else inputBytes[name] = { bytes: null, file: f };
    }
    if (filled.length) a.supplied = filled;
    const held = [version ?? recipeMethod, recipeMethod].find((v) => v !== CALC_METHOD) ?? null;
    if (held !== null) {
      missing.push(entry("calculation", calc, `calculation ${calc} was computed by calculation method ${held}, which this checker does not hold (it holds ${CALC_METHOD})`, { calc, version: held }));
      out.push(settle(a, disclosed));
      continue;
    }
    /* The row's file (`calculations/<calc>/calculation.json`) must say what the signed row states: only the document is
       signed. */
    const rf = files.find((f) => f.kind === "calculation" && f.calc === calc && !f.input) || null;
    if (rf && rf.content && textOf(rf.content) !== calculationFileText(row))
      differs.push(entry("calculation", calc, `calculation ${calc}'s carried file is not the row the signed case document states`, { calc }));
    if (!hashes) { differs.push(entry("calculation", calc, `calculation ${calc}'s inputs cannot be read`, { calc })); out.push(settle(a, disclosed)); continue; }
    const bound = {};
    for (const [name, sha] of Object.entries(hashes)) {
      const { bytes: b, file: f } = inputBytes[name];
      if (!b) {
        missing.push(entry("calculation", calc, `input ${name} of calculation ${calc} is not carried${f && f.state === "differs" ? " as the bytes its hash names" : ""}; fetch the file whose SHA-256 is ${sha}`, { calc, input: name, sha256: sha }));
        continue;
      }
      const v = jsonOf(b);
      if (v === undefined || v === null) { differs.push(entry("calculation", calc, `input ${name} of calculation ${calc} is not a table or figure this checker can read`, { calc, input: name })); continue; }
      bound[name] = v;
    }
    if (missing.length || differs.length) { out.push(settle(a, disclosed)); continue; }
    let key = null;
    try { key = resultKey(recipe, hashes, { methodVersion: CALC_METHOD }); } catch { key = null; }
    if (key !== row.result_key)
      differs.push(entry("calculation", calc, `calculation ${calc}'s result key is stated as ${String(row.result_key)}, and it recomputes to ${key}`, { calc, result: "result_key", stated: row.result_key ?? null, recomputed: key }));
    let r;
    try { r = evaluate(recipe, bound); } catch (e) { r = { refused: "EVALUATE_FAILED", why: String(e && e.message ? e.message : e).slice(0, 200) }; }
    const stated = isObj(row.results) && typeof row.result_key === "string" ? row.results[row.result_key] : undefined;
    if (r && typeof r.refused === "string")
      differs.push(entry("calculation", calc, `calculation ${calc} does not recompute: the evaluator refuses it (${r.refused}: ${r.why})`, { calc, result: row.result_key ?? null, stated: stated ?? null, recomputed: null }));
    else if (stated === undefined || canonicalJson(stated) !== canonicalJson(r.result))
      differs.push(entry("calculation", calc, `calculation ${calc}'s result is stated as ${stated === undefined ? "nothing" : canonicalJson(stated)}, and it recomputes to ${canonicalJson(r.result)}`, { calc, result: row.result_key ?? null, stated: stated ?? null, recomputed: r.result }));
    out.push(settle(a, disclosed));
  }
  return out;
}

/* R20: a calculation's answer from its entries. A row the document discloses as differing or unbound is answered with that
   disclosure: what it disclosed is not a `differs` (or `missing`) entry for being so. */
function settle(a, disclosed) {
  const result = a.differs.length ? "differs" : a.missing.length ? "not_recomputed" : "agrees";
  if (disclosed !== null && result !== "agrees") return { ...a, result, disclosed_entries: { differs: a.differs, missing: a.missing }, differs: [], missing: [] };
  return { ...a, result };
}
