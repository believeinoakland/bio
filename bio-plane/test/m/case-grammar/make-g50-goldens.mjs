/* G50 (fix round 6; CASE-GRAMMAR #21): the R-OLD goldens, recorded at the G50 base (`124e62bfa8`, the tranche tip before
 * G50's jobs) by today's real code, before any change. A one-off script, not a test: the suite never runs it.
 *
 *   node --import ./bio-plane/test/platform-sqlite.mjs bio-plane/test/m/case-grammar/make-g50-goldens.mjs
 *
 * It writes `g50-old-goldens.json` beside it: for two `/3` manifests hand-built from `casefile-fixture.mjs`,
 *   g1  a `ref` with a copy beside an included document (one `ref`, two rows),
 *   g2  a `ref` with an included and an excluded row,
 * today's `caseFileManifestCheck` with the rows and without them, and today's `completeEditionOf`. */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as CG from "../../../src/case-grammar/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { caseDocument, manifestFor, editionInput } from "./casefile-fixture.mjs";
import { sha } from "./helpers.mjs";

const bytesOf = (s) => Buffer.byteLength(s, "utf8");
const REF = "INFO-2026-0004-photo";
const ORIGINAL = "JPEG the original, faces visible";
const COPY = "JPEG the copy, faces covered";
const SECOND = "%PDF the second capture of the same source";
const LABEL = "Faces and plates obscured for publication; the group holds the original";

/* the fixture's case document with its `materials:` block replaced by `rows` (and no attestations) */
function documentWith(rows) {
  const lines = caseDocument().split("\n");
  const out = [];
  let skipping = false;
  for (const line of lines) {
    if (/^(materials|material_attestations):/.test(line)) {
      skipping = true;
      if (line.startsWith("materials:")) out.push(...CG.materialBlockLines({ materials: rows, attestations: [] }));
      continue;
    }
    if (skipping && /^\s/.test(line)) continue;
    skipping = false;
    out.push(line);
  }
  return out.join("\n");
}

function golden(rows, extra) {
  const text = new Map([
    [CG.caseFilePath("case_document"), documentWith(rows)],
    [CG.caseFilePath("case_signature"), "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n"],
    ...extra,
  ]);
  const listed = (m) => [...m].map(([path, t]) => ({ path, sha256: sha(t), bytes: bytesOf(t), part: 1,
                                                     kind: CG.caseFileEntryOf(path).kind }));
  const over = { format: "bio-case-file/3" };
  const edition = CG.completeEditionOf(editionInput(manifestFor(listed(text), over), text));
  text.set(CG.caseFilePath("complete_edition"), edition);
  const manifest = manifestFor(listed(text), over);
  const given = CG.materialsOf(parseFrontmatter(text.get("case.md")).data).materials;
  return { manifest, check_with_rows: CG.caseFileManifestCheck(manifest, { materials: given }),
           check_without_rows: CG.caseFileManifestCheck(manifest), complete_edition: edition,
           complete_edition_sha256: createHash("sha256").update(edition).digest("hex") };
}

const row = (over) => ({ ref: REF, kind: "document", sha: sha(ORIGINAL), text_sha: null, origin: "a member's capture",
                         archived_copy: null, included: false, rests_under: "load_bearing", ...over });

const g1 = golden([
  row({ obscured: { copy: sha(COPY), label: LABEL } }),
  row({ sha: sha(SECOND), text_sha: sha("second text"), included: true }),
], [[CG.caseFilePath("document", REF), SECOND], [CG.caseFilePath("extracted_text", REF), "second text"],
    [CG.caseFilePath("obscured", REF), COPY]]);

const g2 = golden([
  row({ sha: sha(SECOND), text_sha: sha("second text"), included: true }),
  row({ sha: sha("an excluded capture"), included: false }),
], [[CG.caseFilePath("document", REF), SECOND], [CG.caseFilePath("extracted_text", REF), "second text"]]);

const out = fileURLToPath(new URL("./g50-old-goldens.json", import.meta.url));
writeFileSync(out, JSON.stringify({ base: "124e62bfa8", g1, g2 }, null, 1) + "\n");
console.log("g1", g1.check_with_rows.map((d) => d.rule), g1.check_without_rows.map((d) => d.rule));
console.log("g2", g2.check_with_rows.map((d) => d.rule), g2.check_without_rows.map((d) => d.rule));
