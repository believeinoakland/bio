/* case-grammar — the case file's format, `bio-case-file/1` (requirements: `build/requirements/case-grammar.md` R13;
 * DEC-112 (3), `BIO_Publication_v0_1.md` §5C "The case file"; K1134 (1)). The one spelling of the format for
 * `public-read` (its R23, which writes it), `case-checker` (which checks it, and whose R14 is its readable
 * specification) and `case-import` (which imports it). Pure; nothing here throws.
 *
 * THE MANIFEST, as `manifest.json` at the root of each part carries it (canonical JSON, `record-grammar` R12):
 *   {format: "bio-case-file/1", group, case, edition, case_document_sha,
 *    keys:  [{key, fingerprint}],                        the signing keys, each an SSH public key and its fingerprint
 *    parts: [{index, sha256, bytes}],                    one per part, indexed from 1, in order
 *    files: [{path, sha256, bytes, part, kind}]}         every file, in path order, each in exactly one part
 *
 * A PART'S FINGERPRINT is taken over its files, never over its own bytes: the manifest is inside each part, so a hash of
 * the part's bytes could not be written in it. `sha256` is the SHA-256 of one line per file of the part, in path order,
 * `<path> <sha256> <bytes>\n`, and `bytes` the sum of those files' bytes (`casePartDigest`), so a part's fingerprint
 * fixes every byte it carries and is checked from the manifest alone.
 *
 * THE PATHS. Each kind is spelled at one path (`caseFilePath`), and `caseFileEntryOf` reads a path back, so a reader
 * knows which finding or material a file belongs to without a second index:
 *   case.md, case.md.sig, complete-edition.html                          the case document, its signature, the edition
 *   findings/<finding>/finding.md, …/finding.md.sig                       a finding's published bytes and signature
 *   findings/<finding>/grading-facts.json, …/passages.json               its grading facts (strength R35), its passages
 *   materials/<ref>/document, …/extracted.txt, …/observation.md          a material, whole (R12's `ref`)
 *   attestations/<ref>/<name>                                            a signed account, a timestamp token, a co-archive */

import { sha256HexSync } from "../record-grammar/index.mjs";

/** R13: the format token. */
export const CASE_FILE_FORMAT = "bio-case-file/1";
/** R13: the manifest's name at each part's root. No file of the case file may take it. */
export const CASE_FILE_MANIFEST_PATH = "manifest.json";
/** R13: every kind of file a case file carries. */
export const CASE_FILE_KINDS = Object.freeze(["case_document", "case_signature", "complete_edition", "finding",
  "finding_signature", "grading_facts", "passages", "document", "extracted_text", "observation", "attestation"]);
/** R13: the kinds a case file carries exactly once. */
export const CASE_FILE_SINGLE_KINDS = Object.freeze(["case_document", "case_signature", "complete_edition"]);
/** R13: the fields of the manifest, of a key, of a part and of a file, in order. */
export const CASE_FILE_MANIFEST_FIELDS = Object.freeze(["format", "group", "case", "edition", "case_document_sha", "keys",
  "parts", "files"]);
export const CASE_FILE_KEY_FIELDS = Object.freeze(["key", "fingerprint"]);
export const CASE_FILE_PART_FIELDS = Object.freeze(["index", "sha256", "bytes"]);
export const CASE_FILE_FILE_FIELDS = Object.freeze(["path", "sha256", "bytes", "part", "kind"]);

const HEX64 = /^[0-9a-f]{64}$/;
/* A finding id or a material ref as one path segment: what record ids and opaque ids are spelled with. */
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/;
const FINGERPRINT = /^SHA256:[A-Za-z0-9+/]{43}$/;
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

const SINGLE_PATHS = Object.freeze({ case_document: "case.md", case_signature: "case.md.sig",
                                     complete_edition: "complete-edition.html" });
const FINDING_FILES = Object.freeze({ finding: "finding.md", finding_signature: "finding.md.sig",
                                      grading_facts: "grading-facts.json", passages: "passages.json" });
const MATERIAL_FILES = Object.freeze({ document: "document", extracted_text: "extracted.txt",
                                       observation: "observation.md" });

/** R13: the path a file of `kind` is carried at. `key` is the finding id (the finding kinds), the material's ref (the
 *  material kinds), or `[ref, name]` (an attestation); the single kinds take none. Null for anything this format does
 *  not spell. */
export function caseFilePath(kind, key = null) {
  if (Object.hasOwn(SINGLE_PATHS, kind)) return SINGLE_PATHS[kind];
  if (Object.hasOwn(FINDING_FILES, kind)) return SEGMENT.test(String(key ?? "")) ? `findings/${key}/${FINDING_FILES[kind]}` : null;
  if (Object.hasOwn(MATERIAL_FILES, kind)) return SEGMENT.test(String(key ?? "")) ? `materials/${key}/${MATERIAL_FILES[kind]}` : null;
  if (kind === "attestation" && Array.isArray(key) && key.length === 2 && key.every((k) => SEGMENT.test(String(k ?? ""))))
    return `attestations/${key[0]}/${key[1]}`;
  return null;
}

/** R13: what a path spells: `{kind, finding?, ref?, name?}`, or null for a path this format does not spell. */
export function caseFileEntryOf(path) {
  if (typeof path !== "string") return null;
  for (const [kind, p] of Object.entries(SINGLE_PATHS)) if (path === p) return { kind };
  const parts = path.split("/");
  if (parts.length !== 3 || !SEGMENT.test(parts[1])) return null;
  const [top, key, leaf] = parts;
  if (top === "findings") {
    const kind = Object.keys(FINDING_FILES).find((k) => FINDING_FILES[k] === leaf);
    return kind ? { kind, finding: key } : null;
  }
  if (top === "materials") {
    const kind = Object.keys(MATERIAL_FILES).find((k) => MATERIAL_FILES[k] === leaf);
    return kind ? { kind, ref: key } : null;
  }
  if (top === "attestations" && SEGMENT.test(leaf)) return { kind: "attestation", ref: key, name: leaf };
  return null;
}

/** R13: a part's fingerprint and size from the manifest's files: `{sha256, bytes}` over the files whose `part` is
 *  `index`, in path order. */
export function casePartDigest(files, index) {
  const mine = (Array.isArray(files) ? files : [])
    .filter((f) => f && typeof f === "object" && f.part === index && typeof f.path === "string")
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return { sha256: sha256HexSync(mine.map((f) => `${f.path} ${f.sha256} ${f.bytes}\n`).join("")),
           bytes: mine.reduce((n, f) => n + (Number.isSafeInteger(f.bytes) ? f.bytes : 0), 0) };
}

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const shown = (v) => { try { const s = JSON.stringify(v); return s === undefined ? String(v) : s.slice(0, 120); } catch { return "an unreadable value"; } };

/** R13: every way `manifest` departs from `bio-case-file/1`, each `{at, rule, detail}` (`at` the field's place, `rule`
 *  a short name, `detail` one sentence), in the manifest's order; `[]` when it departs in none. Pure; never throws. */
export function caseFileManifestCheck(manifest) {
  const out = [];
  const no = (at, rule, detail) => out.push({ at, rule, detail });
  try {
    if (!plain(manifest)) {
      no("manifest", "not_a_manifest", `a case file's manifest is an object, and this is ${shown(manifest)}`);
      return out;
    }
    for (const k of Object.keys(manifest))
      if (!CASE_FILE_MANIFEST_FIELDS.includes(k)) no(k, "unknown_field", `the manifest has no field ${shown(k)} in ${CASE_FILE_FORMAT}`);
    if (manifest.format !== CASE_FILE_FORMAT)
      no("format", "format", `the format is ${CASE_FILE_FORMAT}, and this manifest states ${shown(manifest.format)}`);
    if (typeof manifest.group !== "string" || !SLUG.test(manifest.group))
      no("group", "group", `the source group is named by its slug, and this manifest states ${shown(manifest.group)}`);
    if (typeof manifest.case !== "string" || !SEGMENT.test(manifest.case))
      no("case", "case", `the case is named by its id, and this manifest states ${shown(manifest.case)}`);
    if (!Number.isSafeInteger(manifest.edition) || manifest.edition < 1)
      no("edition", "edition", `the edition is a whole number from 1, and this manifest states ${shown(manifest.edition)}`);
    if (typeof manifest.case_document_sha !== "string" || !HEX64.test(manifest.case_document_sha))
      no("case_document_sha", "sha256", `the case document's SHA-256 is 64 lower-case hex digits, and this manifest states ${shown(manifest.case_document_sha)}`);

    /* the signing keys */
    if (!Array.isArray(manifest.keys) || !manifest.keys.length)
      no("keys", "keys", "the manifest names at least one signing key, with its fingerprint");
    const prints = new Set();
    (Array.isArray(manifest.keys) ? manifest.keys : []).forEach((k, i) => {
      const at = `keys[${i}]`;
      if (!plain(k)) return no(at, "key", `a signing key is {key, fingerprint}, and this is ${shown(k)}`);
      for (const f of Object.keys(k)) if (!CASE_FILE_KEY_FIELDS.includes(f)) no(`${at}.${f}`, "unknown_field", `a signing key has no field ${shown(f)}`);
      if (typeof k.key !== "string" || !k.key.trim() || /[\r\n]/.test(k.key))
        no(`${at}.key`, "key", "a signing key is its public key on one line");
      if (typeof k.fingerprint !== "string" || !FINGERPRINT.test(k.fingerprint))
        no(`${at}.fingerprint`, "fingerprint", `a key's fingerprint is SHA256: and 43 base64 characters, and this is ${shown(k.fingerprint)}`);
      else if (prints.has(k.fingerprint)) no(`${at}.fingerprint`, "key_twice", `the key ${k.fingerprint} is listed twice`);
      else prints.add(k.fingerprint);
    });

    /* the parts */
    const parts = Array.isArray(manifest.parts) ? manifest.parts : null;
    if (!parts || !parts.length) no("parts", "parts", "the manifest lists at least one part");
    (parts || []).forEach((p, i) => {
      const at = `parts[${i}]`;
      if (!plain(p)) return no(at, "part", `a part is {index, sha256, bytes}, and this is ${shown(p)}`);
      for (const f of Object.keys(p)) if (!CASE_FILE_PART_FIELDS.includes(f)) no(`${at}.${f}`, "unknown_field", `a part has no field ${shown(f)}`);
      if (p.index !== i + 1) no(`${at}.index`, "part_index", `the parts are numbered from 1 in order, so this one is ${i + 1}, and it states ${shown(p.index)}`);
      if (typeof p.sha256 !== "string" || !HEX64.test(p.sha256)) no(`${at}.sha256`, "sha256", `a part's SHA-256 is 64 lower-case hex digits, and this is ${shown(p.sha256)}`);
      if (!Number.isSafeInteger(p.bytes) || p.bytes < 0) no(`${at}.bytes`, "bytes", `a part's size is a whole number of bytes, and this is ${shown(p.bytes)}`);
    });

    /* the files */
    const files = Array.isArray(manifest.files) ? manifest.files : null;
    if (!files) no("files", "files", "the manifest lists every file of the case file");
    const paths = new Set();
    const kinds = new Map();
    const indices = new Set((parts || []).map((p) => (plain(p) ? p.index : null)));
    (files || []).forEach((f, i) => {
      const at = `files[${i}]`;
      if (!plain(f)) return no(at, "file", `a file is {path, sha256, bytes, part, kind}, and this is ${shown(f)}`);
      for (const k of Object.keys(f)) if (!CASE_FILE_FILE_FIELDS.includes(k)) no(`${at}.${k}`, "unknown_field", `a file has no field ${shown(k)}`);
      const entry = caseFileEntryOf(f.path);
      if (!CASE_FILE_KINDS.includes(f.kind)) no(`${at}.kind`, "kind", `a file's kind is one of ${CASE_FILE_KINDS.join(", ")}, and this is ${shown(f.kind)}`);
      if (!entry) no(`${at}.path`, "path", `${shown(f.path)} is not a path ${CASE_FILE_FORMAT} spells for any file`);
      else if (CASE_FILE_KINDS.includes(f.kind) && entry.kind !== f.kind)
        no(`${at}.path`, "path_kind", `${shown(f.path)} is where a ${entry.kind} is carried, and this file says it is a ${f.kind}`);
      if (typeof f.path === "string") {
        if (paths.has(f.path)) no(`${at}.path`, "path_twice", `${shown(f.path)} is listed twice`);
        paths.add(f.path);
      }
      if (typeof f.sha256 !== "string" || !HEX64.test(f.sha256)) no(`${at}.sha256`, "sha256", `a file's SHA-256 is 64 lower-case hex digits, and this is ${shown(f.sha256)}`);
      if (!Number.isSafeInteger(f.bytes) || f.bytes < 0) no(`${at}.bytes`, "bytes", `a file's size is a whole number of bytes, and this is ${shown(f.bytes)}`);
      if (!indices.has(f.part) || f.part == null) no(`${at}.part`, "part", `a file is in one of the parts listed, and this one names ${shown(f.part)}`);
      if (CASE_FILE_KINDS.includes(f.kind)) kinds.set(f.kind, [...(kinds.get(f.kind) || []), f]);
    });
    if (files) for (let i = 1; i < files.length; i++)
      if (plain(files[i - 1]) && plain(files[i]) && typeof files[i - 1].path === "string" && typeof files[i].path === "string"
          && files[i - 1].path > files[i].path) {
        no(`files[${i}]`, "file_order", "the files are listed in path order");
        break;
      }
    if (files) for (const kind of CASE_FILE_SINGLE_KINDS) {
      const n = (kinds.get(kind) || []).length;
      if (n !== 1) no("files", kind, `a case file carries exactly one ${kind}, and this one lists ${n}`);
    }
    const doc = (kinds.get("case_document") || [])[0];
    if (doc && typeof manifest.case_document_sha === "string" && doc.sha256 !== manifest.case_document_sha)
      no("case_document_sha", "case_document_sha", "the case document's SHA-256 is the one its file is listed with");

    /* each part's fingerprint and size, from its files */
    if (files) (parts || []).forEach((p, i) => {
      if (!plain(p) || p.index !== i + 1) return;
      const mine = files.filter((f) => plain(f) && f.part === p.index);
      if (!mine.length) return no(`parts[${i}]`, "part_empty", `part ${p.index} carries no file`);
      const d = casePartDigest(files, p.index);
      if (p.sha256 !== d.sha256) no(`parts[${i}].sha256`, "part_sha256", `part ${p.index}'s SHA-256 is not the one its files give`);
      if (p.bytes !== d.bytes) no(`parts[${i}].bytes`, "part_bytes", `part ${p.index}'s size is not the sum of its files' sizes`);
    });
  } catch {
    no("manifest", "unreadable", "the manifest could not be read whole");
  }
  return out;
}
