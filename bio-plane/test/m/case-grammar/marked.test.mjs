/* case-grammar at its interface, T40 (N798; DEC-185 (1); K2394): R12's `obscured_marked` on a `document` row carried
   as its copy, optional and flat, read back as `obscured: {copy, label, marked}`, an absent one read by the label; and
   R14's complete edition picking the copy line or the unmarked line by `marked`, then printing the label word for word
   when there is one, every earlier edition rendering byte for byte. Each clause with its negative controls (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, sha } from "./helpers.mjs";
import { caseFileFixture, editionInput, PHOTO, PHOTO_ROW, OBSCURED_LABEL, PLAIN_PHOTO, PLAIN_PHOTO_ROW, PLAIN_PHOTO_COPY_BYTES,
         PHOTO_COPY_BYTES, MEMBER_DOC, MEMBER_DOC_ROW, COPY_CLEANED_LABEL, MINUTES } from "./casefile-fixture.mjs";

const fmOf = (text) => parseFrontmatter(text).data;
/* `case-carriage`'s `PUBLISHED_LABEL` (DEC-185 (1)), as handed: this module names no label of its own. */
const PUBLISHED_LABEL = "Published as a copy with none of the original's metadata; the group holds the original";
const COPY = sha(PHOTO_COPY_BYTES);
const PLAIN_COPY = sha(PLAIN_PHOTO_COPY_BYTES);
const UNMARKED = { ...PLAIN_PHOTO_ROW, obscured: { copy: PLAIN_COPY, label: PUBLISHED_LABEL, marked: false } };
const MARKED = { ...PHOTO_ROW, obscured: { copy: COPY, label: OBSCURED_LABEL, marked: true } };

/* ===== R12 ===== */

test("R12 (T40) obscured_marked is written flat after obscured_label when handed, and read back as obscured: {copy, label, marked}", () => {
  assert.equal(CG.MATERIAL_OBSCURED_MARKED_FIELD, "obscured_marked");
  const lines = CG.materialsLines([UNMARKED, MARKED]);
  assert.deepEqual(lines.filter((l) => l.includes("obscured")), [`    obscured_copy: "${PLAIN_COPY}"`, `    obscured_label: "${PUBLISHED_LABEL}"`,
    "    obscured_marked: false", `    obscured_copy: "${COPY}"`, `    obscured_label: "${OBSCURED_LABEL}"`, "    obscured_marked: true"]);
  for (const format of [CG.CASE_DOCUMENT_FORMAT, CG.CASE_DOCUMENT_FORMAT_V6]) {
    const text = doc(format, lines);
    assert.deepEqual(parseFrontmatter(text).findings, []);
    const fm = fmOf(text);
    assert.deepEqual(Object.keys(fm.materials[0]), [...CG.MATERIAL_FIELDS, ...CG.MATERIAL_OBSCURED_FIELDS, CG.MATERIAL_OBSCURED_MARKED_FIELD], "one flat row");
    assert.deepEqual(CG.materialsOf(fm).materials.map((r) => r.obscured), [
      { copy: PLAIN_COPY, label: PUBLISHED_LABEL, marked: false }, { copy: COPY, label: OBSCURED_LABEL, marked: true }], format);
  }
  /* a marked copy with no label, as written */
  assert.deepEqual(CG.materialsOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT, CG.materialsLines([{ ...PHOTO_ROW, obscured: { copy: COPY, label: null, marked: true } }]))))
    .materials[0].obscured, { copy: COPY, label: null, marked: true });
});

test("R12 (T40) negative controls: a row handed no marked (or one that is no boolean) is written byte for byte as before T40, and reads marked by its label: non-null marked, null unmarked; an observation row never states it; never throws", () => {
  for (const marked of [undefined, null, "true", 1]) {
    const lines = CG.materialsLines([{ ...PHOTO_ROW, obscured: { ...PHOTO_ROW.obscured, marked } }]);
    assert.deepEqual(lines, CG.materialsLines([PHOTO_ROW]), String(marked));
    assert.equal(lines.some((l) => l.includes("obscured_marked")), false);
  }
  const back = CG.materialsOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT, CG.materialsLines([PHOTO_ROW, PLAIN_PHOTO_ROW, MEMBER_DOC_ROW])))).materials;
  assert.deepEqual(back.map((r) => r.obscured.marked), [true, false, true], "by the label");
  /* the written word wins over the label, either way */
  const hand = (v, label) => CG.materialsOf({ format: CG.CASE_DOCUMENT_FORMAT, materials: [{ ref: PHOTO, kind: "document", obscured_copy: COPY,
    obscured_label: label, obscured_marked: v }] }).materials[0].obscured.marked;
  assert.deepEqual([hand(false, "L"), hand("false", "L"), hand(true, null), hand("true", null), hand("maybe", "L"), hand(7, null)],
                   [false, false, true, true, true, false]);
  /* an observation row is never carried as its copy */
  assert.equal(CG.materialsLines([{ ...UNMARKED, kind: "observation" }]).some((l) => l.includes("obscured")), false);
  assert.equal(CG.materialsOf(fmOf(doc(CG.CASE_DOCUMENT_FORMAT, CG.materialsLines([{ ref: MINUTES, kind: "document", included: true }])))).materials[0].obscured, null);
  assert.doesNotThrow(() => CG.materialsLines([{ ...PHOTO_ROW, obscured: { copy: COPY, get marked() { throw new Error("boom"); } } }]));
  assert.doesNotThrow(() => CG.materialsOf({ format: CG.CASE_DOCUMENT_FORMAT, materials: [{ kind: "document", get obscured_marked() { throw new Error("boom"); } }] }));
});

/* ===== R14 ===== */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const materialsSection = (html) => html.slice(html.indexOf("<h2>3. "), html.indexOf("<h2>4. "));
const lis = (part) => [...part.slice(0, part.indexOf("</ul>")).matchAll(/<li>([^<]*)<\/li>/g)].map((m) => m[1]);
/* The fixture with one row's lines replaced by `row`'s. */
function editionWith(opts, from, row) {
  const { manifest, files } = caseFileFixture({ ...opts, fileFormat: CG.CASE_FILE_FORMAT });
  const swapped = new Map(files);
  swapped.set("case.md", files.get("case.md").replace(CG.materialsLines([from]).slice(1).join("\n"), CG.materialsLines([row]).slice(1).join("\n")));
  assert.notEqual(swapped.get("case.md"), files.get("case.md"));
  return CG.completeEditionOf(editionInput(manifest, swapped));
}
const listing = (html, ref) => { const m = materialsSection(html); return lis(m.slice(m.indexOf(`<h3>${ref} (document)</h3>`))); };

test("R14 (T40) an unmarked photo's copy carrying a label is listed by the unmarked line, then its label word for word; a marked one by the copy line, then its label", () => {
  const html = editionWith({ plainPhoto: true }, PLAIN_PHOTO_ROW, UNMARKED);
  assert.deepEqual(listing(html, PLAIN_PHOTO).slice(3, 5), [esc(`${CG.OBSCURED_WORDS.unmarked}${PLAIN_COPY}`), esc(PUBLISHED_LABEL)]);
  assert.equal(materialsSection(html).includes(esc(CG.OBSCURED_WORDS.copy)), false, "never the copy line for an unmarked photo");
  const marked = editionWith({ photo: true }, PHOTO_ROW, MARKED);
  assert.deepEqual(listing(marked, PHOTO).slice(4, 6), [esc(`${CG.OBSCURED_WORDS.copy}${COPY}`), esc(OBSCURED_LABEL)]);
  /* marked, with no label: the copy line alone */
  const bare = editionWith({ photo: true }, PHOTO_ROW, { ...PHOTO_ROW, obscured: { copy: COPY, label: null, marked: true } });
  assert.deepEqual(listing(bare, PHOTO).slice(4, 6), [esc(`${CG.OBSCURED_WORDS.copy}${COPY}`), esc("A finding this case relies on rests on it.")]);
  /* the same case file gives the same bytes */
  assert.equal(editionWith({ plainPhoto: true }, PLAIN_PHOTO_ROW, UNMARKED), html);
});

test("R14 (T40) negative controls: an edition whose rows state no obscured_marked renders the bytes it rendered before T40; a marked word written as the label reads gives the same bytes; a cleaned member document keeps its cleaned line", () => {
  /* pinned before T40: a marked photo's edition (T38) and the editions stating no obscured (pre-T37 goldens) */
  const t37 = caseFileFixture({ photo: true, fileFormat: CG.CASE_FILE_FORMAT });
  assert.equal(createHash("sha256").update(CG.completeEditionOf(editionInput(t37.manifest, t37.files))).digest("hex"),
               "910634ae4b5ee876b270213a84d13eafa65e717db54d8360ff5b1449e2c53a35");
  const golden = JSON.parse(readFileSync(new URL("./complete-v7-pre-t37-golden.json", import.meta.url), "utf8"));
  const plain = caseFileFixture({});
  assert.equal(CG.completeEditionOf(editionInput(plain.manifest, plain.files)), golden.v7.html);
  /* stating marked as the label already reads it changes no rendered byte */
  const photos = caseFileFixture({ photo: true, plainPhoto: true, fileFormat: CG.CASE_FILE_FORMAT });
  const before = CG.completeEditionOf(editionInput(photos.manifest, photos.files));
  const both = new Map(photos.files);
  both.set("case.md", photos.files.get("case.md")
    .replace(CG.materialsLines([PHOTO_ROW]).slice(1).join("\n"), CG.materialsLines([MARKED]).slice(1).join("\n"))
    .replace(CG.materialsLines([PLAIN_PHOTO_ROW]).slice(1).join("\n"), CG.materialsLines([{ ...PLAIN_PHOTO_ROW, obscured: { ...PLAIN_PHOTO_ROW.obscured, marked: false } }]).slice(1).join("\n")));
  assert.notEqual(both.get("case.md"), photos.files.get("case.md"));
  assert.equal(materialsSection(CG.completeEditionOf(editionInput(photos.manifest, both))), materialsSection(before));
  /* a label stated with marked false is never printed by the copy line; a cleaned document's line is chosen by its bytes */
  const doc = editionWith({ memberDoc: true }, MEMBER_DOC_ROW, { ...MEMBER_DOC_ROW, obscured: { ...MEMBER_DOC_ROW.obscured, marked: false } });
  const lines = listing(doc, MEMBER_DOC);
  assert.equal(lines.includes(esc(`${CG.OBSCURED_WORDS.cleaned}${MEMBER_DOC_ROW.obscured.copy}`)), true);
  assert.equal(lines.includes(esc(COPY_CLEANED_LABEL)), true);
  assert.equal(lines.some((l) => l.startsWith(esc(CG.OBSCURED_WORDS.unmarked))), false);
});
