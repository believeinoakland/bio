/* G50 test support: a case file made by `public-read`'s real writer (`buildCaseFile`) over facts in `caseFileFacts`' shape, from
   the fixture's whole case (`./fixture.mjs`: real keys and real signatures), with material rows added or changed. The facts a
   test hands in are the rows' own: a `ref` on several rows carries `capture` (the lower-cased `sha`) as `caseFileFacts` gives it. */
import * as CG from "../../../src/case-grammar/index.mjs";
import { buildCaseFile } from "../../../src/public-read/casefile.mjs";
import { serialiseContainer } from "../../../src/container.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { caseFiles, keyFor, sha, A, B, C, MEMO, MINUTES, MINUTES_SHA, OBS } from "./fixture.mjs";

export const u8 = (s) => new TextEncoder().encode(s);

/** The fixture's three rows of material as `buildCaseFile` reads them, from the texts the fixture writes. */
export function baseMaterials(texts) {
  const at = (kind, key) => texts.get(CG.caseFilePath(kind, key));
  const doc = (ref, s) => ({ ref, kind: "document", sha: s, text_sha: sha(at("extracted_text", ref)), bytes_text: at("document", ref), extracted_text: at("extracted_text", ref) });
  return [doc(MINUTES, MINUTES_SHA), doc(MEMO, sha(at("document", MEMO))),
          { ref: OBS, kind: "observation", sha: sha(at("observation", OBS)), text_sha: null, bytes_text: at("observation", OBS) }];
}

/** Build the case file. `fixture` are `caseFiles`' options (`materialRows`, `facts`, …); `materials(texts)` the facts' material
 *  entries and `obscured` the facts' obscured entries (each `{ref, sha, copy, bytes, capture?}`; `bytes` are put in the bucket).
 *  `edit(carried: Map path → bytes, built)` changes carried bytes after the manifest is written. Answers
 *  `{built, parts, manifest, verdictInput}`; `built` is `buildCaseFile`'s own answer. */
export async function buildG50({ fixture = {}, materials = baseMaterials, obscured = [], edit = null } = {}) {
  const { texts } = caseFiles(fixture);
  const at = (kind, key) => texts.get(CG.caseFilePath(kind, key));
  const bucket = new Map();
  const put = (s) => { const b = u8(s); bucket.set(sha(s), b); return sha(s); };
  const doc = at("case_document", null);
  const ids = [A, B, C];
  const facts = {
    case: "CASE-2026-0001", edition: 2,
    document: { text: doc, doc_sha: sha(doc), sig_armored: at("case_signature", null), key_b64: keyFor("group").b64 },
    findings: ids.map((id) => ({ bundle_id: id,
      published: { bundle_sha: put(at("finding", id)), parts: [], sig_armored: at("finding_signature", id) ?? null,
                   key_b64: keyFor(id === C ? "bob" : "alice").b64 } })),
    grading: Object.fromEntries(ids.map((id) => [id, JSON.parse(at("grading_facts", id))])),
    passages: Object.fromEntries(ids.map((id) => [id, JSON.parse(at("passages", id))])),
    materials: materials(texts),
    obscured: obscured.map((o) => ({ ref: o.ref, sha: o.sha, copy: put(o.bytes), registered: true, ...(o.capture !== undefined ? { capture: o.capture } : {}) })),
    attestations: [],
  };
  const read = async (s) => bucket.get(s) ?? null;
  const built = await buildCaseFile({ facts, group: "lakeshore-tenants", read });
  if (!built.ok) return { built, parts: null, manifest: null };
  const carried = new Map(built.files.map((f) => [f.path, new Uint8Array(f.content)]));
  if (edit) edit(carried, built);
  const mbytes = u8(canonicalJson(built.manifest));
  const parts = [];
  for (let i = 1; i <= built.manifest.parts.length; i++) {
    const z = serialiseContainer([{ name: CG.CASE_FILE_MANIFEST_PATH, bytes: mbytes },
      ...built.files.filter((f) => f.part === i && carried.has(f.path)).map((f) => ({ name: f.path, bytes: carried.get(f.path) }))]);
    if (!z.ok) throw new Error(`g50-build: ${z.reason}`);
    parts.push(z.bytes);
  }
  return { built, parts, manifest: built.manifest };
}
