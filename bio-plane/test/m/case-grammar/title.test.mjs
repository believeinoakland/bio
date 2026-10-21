/* case-grammar at its interface, fix round 4 (C47; K4438): R12's `title` on a `materials:` row, the document's title as
   its capture holds it, `null` when it has none or for an observation; a row written before it may lack it and still
   parses. Each clause with its control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, sha } from "./helpers.mjs";
import { caseFileFixture } from "./casefile-fixture.mjs";

const fmOf = (text) => { const p = parseFrontmatter(text); assert.deepEqual(p.findings, [], "the grammar reads every line"); return p.data; };
const V = CG.CASE_DOCUMENT_FORMAT;
const ROW = { ref: "INFO-2026-0001-minutes", kind: "document", sha: sha("bytes"), text_sha: sha("text"),
  origin: "https://www.foia.gov/faq.html", archived_copy: "https://archive.example/faq", included: true, rests_under: "load_bearing" };
const back = (rows, format = V) => CG.materialsOf(fmOf(doc(format, CG.materialsLines(rows)))).materials;

test("R12 (C47) a row's title is written flat after rests_under and round-trips, quotes and line breaks folded as every field's are", () => {
  assert.equal(CG.MATERIAL_TITLE_FIELD, "title");
  const lines = CG.materialsLines([{ ...ROW, title: "Freedom of Information Act: FAQ" }]);
  assert.deepEqual(lines.filter((l) => l.includes("title")), ['    title: "Freedom of Information Act: FAQ"']);
  assert.equal(lines.findIndex((l) => l.includes("title")), lines.findIndex((l) => l.includes("rests_under")) + 1);
  assert.deepEqual(back([{ ...ROW, title: "Freedom of Information Act: FAQ" }])[0].title, "Freedom of Information Act: FAQ");
  assert.equal(back([{ ...ROW, title: 'A "quoted"\ntitle' }])[0].title, "A 'quoted' title");
  /* with a copy carried in the original's place the title still travels, beside the obscured fields */
  const photo = { ...ROW, included: false, title: "Photo of the notice",
    obscured: { copy: sha("copy"), label: "A copy", marked: true, kind: "photo" } };
  const [r] = back([photo]);
  assert.equal(r.title, "Photo of the notice");
  assert.deepEqual(r.obscured, { copy: sha("copy"), label: "A copy", marked: true, kind: "photo" });
});

test("R12 (C47) the title is null when the capture has none and for an observation: handed null it is written null, handed nothing it is not written, handed a non-string it is written null", () => {
  assert.deepEqual(CG.materialsLines([{ ...ROW, title: null }]).filter((l) => l.includes("title")), ["    title: null"]);
  assert.equal(back([{ ...ROW, title: null }])[0].title, null);
  const obs = { ...ROW, kind: "observation", text_sha: null, title: null };
  assert.equal(back([obs])[0].title, null);
  for (const odd of [7, true, {}, ["x"], "", "  "])
    assert.deepEqual(CG.materialsLines([{ ...ROW, title: odd }]).filter((l) => l.includes("title")), ["    title: null"], JSON.stringify(odd));
  /* a row handed no title is written byte for byte as before: the hand-off to a writer that does not know it yet */
  assert.equal(CG.materialsLines([ROW]).some((l) => l.includes("title")), false);
  assert.deepEqual(CG.materialsLines([{ ...ROW, title: undefined }]), CG.materialsLines([ROW]));
});

test("R12 (C47) control: a case written before the title, a row without it, still parses, its title reads null, and nothing else about the row changes", () => {
  const old = back([ROW]);
  assert.equal(old[0].title, null);
  assert.equal(old[0].ref, ROW.ref);
  assert.equal(old[0].included, true);
  const { title, ...rest } = back([{ ...ROW, title: "T" }])[0];
  const { title: none, ...restOld } = old[0];
  assert.equal(title, "T");
  assert.equal(none, null);
  assert.deepEqual(rest, restOld);
  /* hand-written front matter, as an older writer left it */
  assert.equal(CG.materialsOf({ format: V, materials: [{ ref: "R", kind: "document", title: "Hand" }, { ref: "S", kind: "document" }] })
    .materials.map((r) => r.title).join("|"), "Hand|");
  assert.deepEqual(CG.materialsOf({ format: V, materials: [{ ref: "R", title: "null" }, { ref: "S", title: 4 }] }).materials.map((r) => r.title), [null, null]);
  assert.doesNotThrow(() => CG.materialsOf({ format: V, materials: [{ ref: "R", get title() { throw new Error("boom"); } }] }));
  assert.doesNotThrow(() => CG.materialsLines([{ ...ROW, get title() { throw new Error("boom"); } }]));
});

test("R12 (C47) the grammar's own check, caseFileManifestCheck given the rows, accepts a case with titles and one without", () => {
  const { manifest, files } = caseFileFixture({ fileFormat: CG.CASE_FILE_FORMAT });
  const rows = CG.materialsOf(fmOf(files.get("case.md"))).materials;
  assert.ok(rows.length > 0);
  for (const title of ["A title", null, undefined])
    assert.deepEqual(CG.caseFileManifestCheck(manifest, { materials: rows.map((r) => ({ ...r, title })) }), [], String(title));
});
