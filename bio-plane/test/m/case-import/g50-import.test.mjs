/* case-import — G50 (fix round 6): two captures of one `ref` and the store of imported files keyed by path (R1, R13).
   `importCaseFile` reads a case file through `readCaseFile` and checks its manifest with `caseFileManifestCheck(read.manifest)`
   (no rows), then stores every file with `INSERT OR IGNORE INTO case_import_files … path`, which would silently drop a second
   file at one path.

   The job's finding on a repeated path: the check runs before the store and flags `path_twice` for every format, so a `/3`
   file whose manifest lists one path twice is refused `IMPORT_NOT_A_CASE_FILE` at the check and never reaches the store; the
   third test holds that. A file this plane writes under `/4` lists no path twice (public-read's discriminated paths), so the
   store drops nothing: the first test holds that both files are stored. The case file is made by `public-read`'s real
   `buildCaseFile`; the first two tests are red by name until case-grammar's `/4` and public-read's writer merge. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { seeded, V, rowOk } from "./fixture.mjs";
import { KEY } from "../publication/fixture.mjs";
import { buildCaseFile } from "../../../src/public-read/casefile.mjs";
import { serialiseContainer } from "../../../src/container.mjs";
import { caseFileManifestCheck, CASE_FILE_MANIFEST_PATH, CASE_FILE_FORMAT } from "../../../src/case-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const utf8 = (s) => new TextEncoder().encode(s);
const REF = "INFO-2026-0001-minutes";
const DOC = "---\nformat: bio-case-document/7\ncase: CASE-2026-0001\n---\nthe case\n";
/* two captures of one source, both held whole: the address re-fetched after it changed, both captures kept */
const CAPTURES = [
  { sha: sha("minutes, as first captured"), bytes_text: "minutes, as first captured", text: "text of the first capture" },
  { sha: sha("minutes, as re-captured"), bytes_text: "minutes, as re-captured", text: "text of the second capture" },
];
const materialOf = (c) => ({ ref: REF, kind: "document", sha: c.sha, bytes_text: c.bytes_text, text_sha: sha(c.text), extracted_text: c.text,
                             origin: "https://example.org/minutes", archived_copy: null, included: true, rests_under: "load_bearing", archives: [] });
const factsOf = (captures) => ({ case: "CASE-2026-0001", edition: 1,
  document: { text: DOC, doc_sha: sha(DOC), sig_armored: null, key_b64: KEY },
  findings: [], grading: {}, passages: {}, materials: captures.map(materialOf), obscured: [], attestations: [], calculations: [] });

/** The parts of a built case file as stored ZIPs: the manifest at the root and each file at its path, once. */
function zipOf(manifest, files) {
  const entries = [{ name: CASE_FILE_MANIFEST_PATH, bytes: utf8(canonicalJson(manifest)) }];
  const seen = new Set();
  for (const f of files) if (!seen.has(f.path)) { seen.add(f.path); entries.push({ name: f.path, bytes: new Uint8Array(f.content) }); }
  const z = serialiseContainer(entries);
  assert.equal(z.ok, true, JSON.stringify(z).slice(0, 200));
  return [z.bytes];
}
const built = async (captures) => {
  const b = await buildCaseFile({ facts: factsOf(captures), group: "parks-group", read: async () => null });
  assert.equal(b.ok, true, JSON.stringify(b).slice(0, 300));
  return b;
};
const imp = (w, parts) => w.ci.importCaseFile({ parts, by: V("alice"), viewer: V("alice") });
const paths = (w) => w.rows(`SELECT path FROM case_import_files ORDER BY path`).map((r) => r.path);

test("R1 R13 a /4 case file of two included captures of one ref imports, and the store holds both captures' files", async () => {
  const b = await built(CAPTURES);
  assert.equal(b.manifest.format, "bio-case-file/4", "the writer declares /4 for a discriminated path");
  assert.deepEqual(caseFileManifestCheck(b.manifest), [], "the case file meets the format");
  const w = seeded({ realChecker: true });
  const r = await imp(w, zipOf(b.manifest, b.files));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const listed = b.manifest.files.map((f) => f.path).sort();
  assert.equal(new Set(listed).size, listed.length, "no path is listed twice");
  assert.deepEqual(paths(w), listed, "every file the manifest lists is stored: nothing is dropped at one path");
  for (const c of CAPTURES) {
    const own = b.manifest.files.find((f) => f.path.includes(c.sha) && f.kind === "document");
    assert.ok(own, `a document file under the capture ${c.sha.slice(0, 8)}`);
    const got = w.ci.fileOf({ import: r.import, edition: 1, path: own.path });
    assert.equal(got && got.sha, own.sha256, "each capture's own bytes are read back at its own path");
  }
  /* control: the same import of the same bytes writes nothing more */
  const again = await imp(w, zipOf(b.manifest, b.files));
  assert.equal(again.existed, true);
  assert.deepEqual(paths(w), listed);
});

test("R1 the same case file with its format edited to /3 is refused IMPORT_NOT_A_CASE_FILE, writing nothing", async () => {
  const b = await built(CAPTURES);
  const w = seeded({ realChecker: true });
  const old = { ...b.manifest, format: CASE_FILE_FORMAT };
  const r = await imp(w, zipOf(old, b.files));
  rowOk(r, "IMPORT_NOT_A_CASE_FILE");
  assert.deepEqual(r.departures, caseFileManifestCheck(old), "the departures are the case-grammar check's own");
  assert.ok(r.departures.length > 0);
  assert.deepEqual(paths(w), []);
  assert.equal(w.count("case_imports"), 0);
  /* control: the unedited /4 file is accepted */
  assert.equal((await imp(w, zipOf(b.manifest, b.files))).ok, true);
});

test("R1 R13 a /3 case file whose manifest lists one path twice is refused at the manifest check and never reaches the store", async () => {
  const b = await built([CAPTURES[0]]);
  assert.equal(b.manifest.format, CASE_FILE_FORMAT, "one capture keeps /3");
  const twice = { ...b.manifest, files: [...b.manifest.files, b.manifest.files.find((f) => f.kind === "document")] };
  const w = seeded({ realChecker: true });
  const r = await imp(w, zipOf(twice, b.files));
  rowOk(r, "IMPORT_NOT_A_CASE_FILE");
  assert.deepEqual(r.departures, caseFileManifestCheck(twice));
  assert.ok(r.departures.length > 0, "the repeated path is a departure");
  assert.deepEqual(paths(w), [], "no file was stored");
  assert.equal(w.count("case_import_editions"), 0);
  /* control: the same case file listing each path once is imported, every file stored once */
  const ok = await imp(w, zipOf(b.manifest, b.files));
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual(paths(w), b.manifest.files.map((f) => f.path).sort());
});
