/* public-read — THE CASE FILE (requirements: `build/requirements/public-read.md` R5, R6, R23, R24; `case-grammar` R13, R14,
 * R17; DEC-112 (2), (3); Publication §5C; K1315, K1316). What a published case edition carries so that anybody can check
 * it, and recreate its findings, without this instance: the signed case document and its signature, the complete
 * edition, each finding's published bytes, signature, grading facts and passages, every included material whole with its
 * extracted text, the attestations, and the signing keys. Built once, by the Worker's assembly (`assembleCaseContainer`,
 * `../publication/worker.mjs`), from what the published projection holds (`PublicRead.caseFileFacts`) and the published
 * bucket; served part by part (`op=publishedbytes&sha256=<manifest>&format=zip&part=<n>`).
 *
 * THE FORMAT IS `case-grammar`'s (its R13, `bio-case-file/1`): every path is `caseFilePath`'s, the manifest is
 * `CASE_FILE_MANIFEST_PATH` at each part's root, the files are listed in path order and each part's digest is
 * `casePartDigest`'s; this file writes the format and decides nothing it states. What is this module's (K1315, reported):
 * each file sits at its path directly under the part's root; an attestation is named `<n>-<by_kind>.json` under its
 * material's ref, `n` its place among that material's rows; a key is written on one line as `<type> <base64>`.
 *
 * PARTS (R5, R23). Each part is a stored ZIP (`../container.mjs`, the plane's one serialiser) carrying the same
 * manifest at its root; files go into parts in manifest order and a new part opens before a file that would take the
 * part past the bound (64 MiB, R5). A file larger than the bound sits alone in its part, which then answers
 * `CONTAINER_TOO_LARGE` (C-98.7) at the zip while the file is still served by its own hash: a case file is never refused
 * for its size and nothing is left out. */

import { canonicalJson } from "../record-grammar/index.mjs";
import { CASE_FILE_FORMAT, CASE_FILE_MANIFEST_PATH, caseFilePath, casePartDigest, completeEditionOf }
  from "../case-grammar/index.mjs";
import { CONTAINER_MAX_BYTES } from "../container.mjs";

const enc = new TextEncoder();
const utf8 = (s) => enc.encode(String(s));

export async function sha256Hex(bytes) {
  const d = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const b64 = (bytes) => { let s = ""; for (const x of bytes) s += String.fromCharCode(x); return btoa(s); };
const unb64 = (s) => { try { return Uint8Array.from(atob(String(s)), (ch) => ch.charCodeAt(0)); } catch { return null; } };

/** A signing key's fingerprint as `ssh-keygen -l` prints it: `SHA256:` and the unpadded base64 of the SHA-256 of the key's
 *  wire bytes; null for a key that is not base64. */
export async function keyFingerprint(keyB64) {
  const raw = unb64(keyB64);
  if (!raw || !raw.length) return null;
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
  return `SHA256:${b64(d).replace(/=+$/, "")}`;
}

/* R6: the assembly's one statement that it built nothing, naming what it could not read. */
const notAssembled = (cause, what) => ({ ok: false, reason: "CASE_FILE_NOT_ASSEMBLED", cause, ...what,
  detail: "the case edition is published and its findings answer by hash; its case file was not built, because it would "
        + "have left out something it must carry. Nothing was recorded for it." });

/** A signing key on one line, as an SSH public key is written: its type (the wire blob's first string) and its base64. */
export function keyLine(keyB64) {
  const raw = unb64(keyB64);
  if (!raw || raw.length < 4) return String(keyB64 ?? "");
  const n = ((raw[0] << 24) | (raw[1] << 16) | (raw[2] << 8) | raw[3]) >>> 0;
  const type = n > 0 && n < 64 && raw.length >= 4 + n ? new TextDecoder().decode(raw.slice(4, 4 + n)) : "";
  return /^[a-z0-9@.-]+$/.test(type) ? `${type} ${keyB64}` : String(keyB64);
}

/* What `serialiseContainer` counts for one entry: its payload and both headers' copies of its name. */
const entryCost = (name, bytes) => bytes + utf8(name).length * 2 + 76;

/** R23, R24, R6: the case file for one case edition, from `facts` (`PublicRead.caseFileFacts`, the published projection)
 *  and `read(sha)` (the published bucket's bytes by hash, or null). `group` is the publishing group's slug. Answers
 *  `{ok: true, manifest, files: [{path, kind, sha256, bytes, part, content}], unheld}`, `unheld` naming each included
 *  material the projection holds no bytes for at its stated digest (the checker then shows it missing, K1316); or
 *  `CASE_FILE_NOT_ASSEMBLED` naming what it could not read, where a part a finding published cannot be read at its hash
 *  or the signed document's bytes do not hash to its digest: a case file that would leave out what it must carry is
 *  never built. It is a statement inside an act that has committed, never a refusal (R6). `maxBytes` is the part bound
 *  (R5). */
export async function buildCaseFile({ facts, group = null, read, maxBytes = CONTAINER_MAX_BYTES }) {
  const files = [];
  const add = async (path, kind, content) => {
    files.push({ path, kind, sha256: await sha256Hex(content), bytes: content.length, content });
  };
  const docBytes = utf8(facts.document.text);
  if ((await sha256Hex(docBytes)) !== facts.document.doc_sha)
    return notAssembled("the signed case document's text does not hash to its digest", { sha256: facts.document.doc_sha });
  await add(caseFilePath("case_document"), "case_document", docBytes);
  await add(caseFilePath("case_signature"), "case_signature", utf8(facts.document.sig_armored ?? ""));

  for (const f of facts.findings) {
    const at = (kind) => caseFilePath(kind, f.bundle_id);
    if (f.published) {
      /* A finding's published bytes are its `bundle.md` (the part its signature covers, at `bundle_sha`). */
      const p = (f.published.parts || []).find((x) => x && x.sha256 === f.published.bundle_sha)
        ?? { path: "bundle.md", sha256: f.published.bundle_sha };
      const bytes = await read(p.sha256);
      if (!bytes || (await sha256Hex(bytes)) !== p.sha256)
        return notAssembled("a finding's published bytes are not in the published object store at their hash",
                            { finding: f.bundle_id, sha256: p.sha256 });
      await add(at("finding"), "finding", bytes);
      if (f.published.sig_armored) await add(at("finding_signature"), "finding_signature", utf8(f.published.sig_armored));
    }
    await add(at("grading_facts"), "grading_facts", utf8(canonicalJson(facts.grading[f.bundle_id] || [])));
    await add(at("passages"), "passages", utf8(canonicalJson(facts.passages[f.bundle_id] || [])));
  }

  /* Included material, whole, each at the digest the signed document states: bytes that do not hash to it are not
     carried (never the wrong bytes under a right name), and the material is named in `unheld`. */
  const unheld = [];
  const held = async (sha, inline) => {
    if (!/^[0-9a-f]{64}$/.test(String(sha ?? ""))) return null;
    const bytes = inline != null ? utf8(inline) : await read(sha);
    return bytes && (await sha256Hex(bytes)) === sha ? bytes : null;
  };
  for (const m of facts.materials) {
    const kind = m.kind === "observation" ? "observation" : "document";
    const bytes = await held(m.sha, m.bytes_text);
    if (!bytes) unheld.push({ ref: m.ref, sha: m.sha ?? null, what: kind === "observation" ? "text" : "bytes" });
    else await add(caseFilePath(kind, m.ref), kind, bytes);
    if (kind === "document") {
      const tb = await held(m.text_sha, m.extracted_text);
      if (!tb) unheld.push({ ref: m.ref, sha: m.text_sha ?? null, what: "extracted_text" });
      else await add(caseFilePath("extracted_text", m.ref), "extracted_text", tb);
    }
  }
  const nth = new Map();
  for (const a of facts.attestations) {
    const n = (nth.get(a.row.ref) || 0) + 1;
    nth.set(a.row.ref, n);
    let carried = null;
    if (a.held_sha) {
      const bytes = await held(a.held_sha, a.held_text);
      carried = bytes ? { sha256: a.held_sha, bytes_b64: b64(bytes) } : null;
      if (!bytes) unheld.push({ ref: a.row.ref, sha: a.held_sha, what: "attestation" });
    }
    await add(caseFilePath("attestation", [a.row.ref, `${n}-${a.row.by_kind}.json`]), "attestation",
              utf8(canonicalJson({ row: a.row, account: a.account ?? null, held: carried })));
  }
  const unspelled = files.filter((f) => typeof f.path !== "string");
  if (unspelled.length)
    return notAssembled("a finding id or a material's ref is not one the case file's format can spell as a path",
                        { kinds: unspelled.map((f) => f.kind) });

  /* The signing keys: the case document's signer's and each finding's, once each, in the order they are met. */
  const keys = [];
  for (const k of [facts.document.key_b64, ...facts.findings.map((f) => f.published && f.published.key_b64)]) {
    if (typeof k !== "string" || !k || keys.some((x) => x.b64 === k)) continue;
    keys.push({ b64: k, key: keyLine(k), fingerprint: await keyFingerprint(k) });
  }
  const head = { format: CASE_FILE_FORMAT, group, case: facts.case, edition: facts.edition,
                 case_document_sha: facts.document.doc_sha,
                 keys: keys.map((k) => ({ key: k.key, fingerprint: k.fingerprint })) };

  /* R24: the complete edition, rendered by `case-grammar` from every other file (its R14). */
  const html = completeEditionOf({ ...head,
    files: files.map((f) => ({ path: f.path, kind: f.kind, sha256: f.sha256, bytes: f.bytes, content: f.content })) });
  const ce = typeof html === "string" ? utf8(html) : html instanceof Uint8Array ? html : utf8("");
  await add(caseFilePath("complete_edition"), "complete_edition", ce);
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const manifestOf = (assign, count) => {
    const rows = files.map((f, j) => ({ path: f.path, sha256: f.sha256, bytes: f.bytes, part: assign[j], kind: f.kind }));
    return { ...head,
             parts: Array.from({ length: count }, (_, i) => ({ index: i + 1, ...casePartDigest(rows, i + 1) })),
             files: rows };
  };
  /* Packing, in path order: a part's cost is its files' and the manifest's (every part carries it). The manifest's size
     depends on the packing, so the reserve grows until the packing it gives fits under it. */
  let reserve = 4096, assign = [], count = 1;
  for (let round = 0; round < 8; round++) {
    assign = []; count = 1;
    let used = 0;
    for (const f of files) {
      const c = entryCost(f.path, f.bytes);
      if (used > 0 && used + c > maxBytes - reserve) { count += 1; used = 0; }
      assign.push(count);
      used += c;
    }
    const size = entryCost(CASE_FILE_MANIFEST_PATH, utf8(JSON.stringify(manifestOf(assign, count), null, 1)).length);
    if (size <= reserve) break;
    reserve = size + 1024;
  }
  return { ok: true, manifest: manifestOf(assign, count), unheld, files: files.map((f, j) => ({ ...f, part: assign[j] })) };
}

/** R5, R6: is this manifest a case file's (`bio-case-file/1`), rather than a container's from before T28. */
export const isCaseFileManifest = (manifest) => !!(manifest && manifest.format === CASE_FILE_FORMAT);

/** R5, R6: one part of a case file in the shape `../container.mjs`' `containerEntries` reads (its `parts[]` and
 *  `layout`), so the part is assembled, and a missing file refused `PART_MISSING` (C-98.5), at that one governed site:
 *  the part's files in manifest order, each at its path under the part's root, the manifest at that root. `index` is the part asked for, a
 *  whole number the manifest lists; any other answers null. */
export function caseFilePartLayout(manifest, index) {
  const parts = Array.isArray(manifest.parts) ? manifest.parts.map((p) => Number(p.index)) : [];
  if (!parts.includes(index)) return null;
  return { case: manifest.case,
           layout: { root: "", manifest_at: CASE_FILE_MANIFEST_PATH, parts_at: "path" },
           parts: (Array.isArray(manifest.files) ? manifest.files : [])
             .filter((f) => f && Number(f.part) === index && typeof f.path === "string" && typeof f.sha256 === "string")
             .map((f) => ({ path: f.path, sha256: f.sha256 })) };
}

/** R5: the parts a case file's manifest lists, by index. */
export const caseFileParts = (manifest) => (Array.isArray(manifest.parts) ? manifest.parts.map((p) => Number(p.index)) : []);
