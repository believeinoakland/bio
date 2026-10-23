/* One-off, NOT a test, never run by the suite (G50, R-OLD). Run at the G50 base (the tranche commit before any G50 job merges,
   124e62bfa8) by today's real code, it records `g50-old-verdicts.json`: two `/3` case files built by `public-read`'s real
   `buildCaseFile` over facts in `caseFileFacts`' shape, and what today's `checkCaseFile` answers over their parts.
     (g1) a `ref` with a copy beside an included document     (g2) a `ref` with an included and an excluded row
   The parts' bytes are recorded too, so that the new reader is run over the very bytes the old one read.
   Usage, from bio-plane/: node --import ./test/platform-sqlite.mjs test/m/case-checker/make-g50-goldens.mjs */
import { writeFileSync } from "node:fs";
import * as CG from "../../../src/case-grammar/index.mjs";
import * as CC from "../../../src/case-checker/index.mjs";
import { buildCaseFile } from "../../../src/public-read/casefile.mjs";
import { serialiseContainer } from "../../../src/container.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { caseFiles, keyFor, sha, A, B, C, MINUTES, MINUTES_SHA, OBS } from "./fixture.mjs";

const u8 = (s) => new TextEncoder().encode(s);
const TWIN = "INFO-2026-0050-twin";
const TWIN_BYTES = "%PDF-1.7 the twin, as captured", TWIN_COPY = "%PDF-1.7 the twin, faces covered", TWIN_OTHER = "%PDF-1.7 the twin, captured again";
const TWIN_UNITS = [{ extent: { kind: "pdf-page", page: 0 }, ref: "page 1", text: "A twin page." }];
const LABEL = "Faces and plates obscured for publication; the team holds the original";

/* g1: TWIN on two rows, the first carried as its copy, the second an included document. g2: TWIN included, and excluded. */
const rowsFor = (which) => (rows) => [...rows, ...(which === "g1"
  ? [{ ref: TWIN, kind: "document", sha: sha(TWIN_BYTES), text_sha: null, origin: "https://records.example/twin", archived_copy: null, included: false,
      rests_under: "supporting", obscured: { copy: sha(TWIN_COPY), label: LABEL } },
     { ref: TWIN, kind: "document", sha: sha(TWIN_OTHER), text_sha: sha(CG.extractedTextOf(TWIN_UNITS)), origin: "https://records.example/twin2", archived_copy: null,
       included: true, rests_under: "supporting" }]
  : [{ ref: TWIN, kind: "document", sha: sha(TWIN_BYTES), text_sha: sha(CG.extractedTextOf(TWIN_UNITS)), origin: "https://records.example/twin", archived_copy: null,
       included: true, rests_under: "supporting" },
     { ref: TWIN, kind: "document", sha: sha(TWIN_OTHER), text_sha: null, origin: "https://records.example/twin2", archived_copy: null,
       included: false, rests_under: "supporting" }])];

async function build(which) {
  /* the case document, its signature and the findings as the fixture writes them (real keys); the case file by the real writer */
  const { texts } = caseFiles({ materialRows: rowsFor(which) });
  const at = (kind, key) => texts.get(CG.caseFilePath(kind, key));
  const bucket = new Map();
  const put = (s) => { const b = u8(s); bucket.set(sha(s), b); return sha(s); };
  const doc = at("case_document");
  const facts = {
    case: "CASE-2026-0001", edition: 2,
    document: { text: doc, doc_sha: sha(doc), sig_armored: at("case_signature"), key_b64: keyFor("group").b64 },
    findings: [A, B, C].map((id) => ({ bundle_id: id,
      published: { bundle_sha: put(at("finding", id)), parts: [], sig_armored: at("finding_signature", id) ?? null,
        /* the keys the case file lists are the document's and each finding's: bob signs an account, so he is listed by C's row */
        key_b64: keyFor(id === C ? "bob" : "alice").b64 } })),
    grading: Object.fromEntries([A, B, C].map((id) => [id, JSON.parse(at("grading_facts", id))])),
    passages: Object.fromEntries([A, B, C].map((id) => [id, JSON.parse(at("passages", id))])),
    materials: [
      { ref: MINUTES, kind: "document", sha: MINUTES_SHA, text_sha: sha(at("extracted_text", MINUTES)), bytes_text: at("document", MINUTES), extracted_text: at("extracted_text", MINUTES) },
      { ref: CG.caseFileEntryOf(CG.caseFilePath("document", "INFO-2026-0002-memo")).ref, kind: "document", sha: sha(at("document", "INFO-2026-0002-memo")),
        text_sha: sha(at("extracted_text", "INFO-2026-0002-memo")), bytes_text: at("document", "INFO-2026-0002-memo"), extracted_text: at("extracted_text", "INFO-2026-0002-memo") },
      { ref: OBS, kind: "observation", sha: sha(at("observation", OBS)), text_sha: null, bytes_text: at("observation", OBS) },
      ...(which === "g1"
        ? [{ ref: TWIN, kind: "document", sha: sha(TWIN_OTHER), text_sha: sha(CG.extractedTextOf(TWIN_UNITS)), bytes_text: TWIN_OTHER, extracted_text: CG.extractedTextOf(TWIN_UNITS) }]
        : [{ ref: TWIN, kind: "document", sha: sha(TWIN_BYTES), text_sha: sha(CG.extractedTextOf(TWIN_UNITS)), bytes_text: TWIN_BYTES, extracted_text: CG.extractedTextOf(TWIN_UNITS) }])],
    obscured: which === "g1" ? [{ ref: TWIN, sha: sha(TWIN_BYTES), copy: put(TWIN_COPY), registered: true }] : [],
    attestations: [],
  };
  const read = async (s) => bucket.get(s) ?? null;
  const built = await buildCaseFile({ facts, group: "lakeshore-tenants", read });
  if (!built.ok) throw new Error(`${which}: ${JSON.stringify(built)}`);
  const n = built.manifest.parts.length;
  const mbytes = u8(canonicalJson(built.manifest));
  const parts = [];
  for (let i = 1; i <= n; i++) {
    const z = serialiseContainer([{ name: CG.CASE_FILE_MANIFEST_PATH, bytes: mbytes },
      ...built.files.filter((f) => f.part === i).map((f) => ({ name: f.path, bytes: new Uint8Array(f.content) }))]);
    if (!z.ok) throw new Error(`${which}: ${z.reason}`);
    parts.push(z.bytes);
  }
  const verdict = await CC.checkCaseFile({ parts });
  return { format: built.manifest.format, paths: built.manifest.files.map((f) => f.path), unheld: built.unheld,
           parts_b64: parts.map((p) => Buffer.from(p).toString("base64")), verdict };
}

const out = { base: "124e62bfa8", g1: await build("g1"), g2: await build("g2") };
writeFileSync(new URL("./g50-old-verdicts.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
for (const k of ["g1", "g2"]) console.log(k, out[k].format, out[k].unheld.length, out[k].verdict.integrity.intact,
  out[k].verdict.findings.map((f) => f.result).join(","), JSON.stringify(out[k].verdict.integrity.departures).slice(0, 300));
