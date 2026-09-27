/* content: the extent grammar (R1–R10, R33), its catalogue rows (R38's C-45 share) and R40. Pure: no record. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  CONTENT_EXTENT_KINDS, CONTENT_EXTENT_DOCUMENT_ONLY, canonicalExtent, describeExtent, contentIdFor, contentCitedAs,
  citationExtent, citationContentId, extentRelation, checkContentExtent, mintUndetermined, ENVELOPE_ITEM_KINDS,
  CONTENT_EXTENT_OWN_CHECKS, pageBoxesOf, unitChainKind, unitTargetOf,
} from "../../../src/content/index.mjs";

const H = "a".repeat(64);
const ctxOf = (o = {}) => ({ chain: [{ step: "layer", tier: 1 }], pageCount: null, container: {}, ...o });
const code = (r) => (r ? r.code : null);

test("R1: exactly the eight kinds and envelope are extents; dom is C-45.4; anything else, a missing field or a malformed value is C-45.3", () => {
  assert.deepEqual(Object.keys(CONTENT_EXTENT_KINDS).sort(),
    ["doc-para", "doc-table", "document", "envelope", "image", "pdf-page", "sheet-cell", "sheet-range", "slide-shape"]);
  const dom = checkContentExtent({ kind: "dom", selector: "p" }, ctxOf());
  assert.equal(code(dom), "CONTENT_EXTENT_NO_PRODUCER"); assert.equal(dom.check, "C-45.4");
  for (const bad of [null, "document", {}, { kind: "chapter" }, { kind: "pdf-page" }, { kind: "pdf-page", page: -1 },
                     { kind: "pdf-page", page: 0, rect: [0, 0, 1] }, { kind: "sheet-cell", sheet: "S" },
                     { kind: "sheet-cell", sheet: "S", cell: "1A" }, { kind: "doc-para", para: 1.5 },
                     { kind: "slide-shape", slide: 0 }, { kind: "sheet-range", sheet: "S", range: "A1:" },
                     { kind: "doc-table", table: -1 }, { kind: "image" }, { kind: "image", part: "xyz" },
                     { kind: "image", part: H, page: 0 }, { kind: "envelope", item: "comment", part: "p" }]) {
    const r = checkContentExtent(bad, ctxOf());
    assert.equal(code(r), "CONTENT_EXTENT_UNREADABLE", JSON.stringify(bad));
    assert.equal(r.check, "C-45.3");
    assert.ok(r.translation && r.detail);
  }
  /* a malformed extent is never read as the whole document */
  assert.notEqual(checkContentExtent({ kind: "pdf-page", page: "x" }, ctxOf()), null);
  for (const good of [{ kind: "document" }, { kind: "pdf-page", page: 0 }, { kind: "sheet-cell", sheet: "S", cell: "B2" },
                      { kind: "slide-shape", slide: 1 }, { kind: "doc-para", para: 0 }, { kind: "sheet-range", sheet: "S", range: "A1:B2" },
                      { kind: "doc-table", table: 0 }, { kind: "image", part: H, cited_as: "bytes" }, { kind: "image", page: 0 },
                      { kind: "envelope", item: "comment", part: "word/comments.xml", n: 0 }])
    assert.equal(checkContentExtent(good, ctxOf()), null, JSON.stringify(good));
});

test("R2: one canonical form per extent (rect corners ordered, A1 $ and case removed, part lowercased, fixed field order); describeExtent keeps a caller's ref", () => {
  assert.equal(canonicalExtent({ kind: "pdf-page", page: 2, rect: [10, 20, 1, 2] }),
               canonicalExtent({ rect: [1, 2, 10, 20], page: 2, kind: "pdf-page", ref: "anything" }));
  assert.equal(canonicalExtent({ kind: "sheet-cell", sheet: "S", cell: "$b$14" }),
               canonicalExtent({ kind: "sheet-cell", sheet: "S", cell: "B14" }));
  assert.equal(canonicalExtent({ kind: "sheet-range", sheet: "S", range: "$C$10:a1" }),
               canonicalExtent({ kind: "sheet-range", sheet: "S", range: "A1:C10" }));
  assert.equal(canonicalExtent({ kind: "image", part: H.toUpperCase(), cited_as: "bytes" }),
               canonicalExtent({ kind: "image", part: H }));
  assert.equal(canonicalExtent({ kind: "document", page: 3 }), canonicalExtent({ kind: "document" }));
  assert.notEqual(canonicalExtent({ kind: "slide-shape", slide: 2, shape: 1 }), canonicalExtent({ kind: "slide-shape", slide: 2 }));
  assert.equal(describeExtent({ kind: "pdf-page", page: 0 }), "page 1");
  assert.equal(describeExtent({ kind: "pdf-page", page: 0, rect: [0, 0, 1, 1] }), "page 1, a region of it");
  assert.equal(describeExtent({ kind: "doc-para", para: 3 }), "¶4");
  assert.equal(describeExtent({ kind: "sheet-cell", sheet: "S", cell: "B2" }), "S!B2");
  assert.equal(describeExtent({ kind: "slide-shape", slide: 7, shape: 3 }), "slide 7");
  assert.equal(describeExtent({ kind: "document" }), "the whole document");
  assert.equal(describeExtent({ kind: "pdf-page", page: 0, ref: "  the top half  " }), "the top half");
  assert.equal(describeExtent({ kind: "document", ref: "   " }), "the whole document");
});

test("R3: the content id is SHA-256 over {v:1, capture_sha, canonical extent, canonical chain or null}; one passage under one chain has one id, another chain another", () => {
  const e = { kind: "pdf-page", page: 1 };
  const chain = [{ step: "layer", tier: 1 }];
  const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(",")}]`
    : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}`
    : JSON.stringify(v));
  const want = createHash("sha256").update(canon({ v: 1, capture_sha: "c", extent: canonicalExtent(e), chain: canon(chain) })).digest("hex");
  assert.equal(contentIdFor("c", e, chain), want);
  assert.equal(contentIdFor("c", { ...e, ref: "x" }, chain), want, "the human form is not in the address");
  assert.notEqual(contentIdFor("c", e, [{ step: "ocr", engine: "t" }]), want);
  assert.notEqual(contentIdFor("c", e, null), contentIdFor("c", e, []), "a null chain is not an empty one");
  assert.match(contentIdFor("c", e, null), /^[0-9a-f]{64}$/);
});

test("R4: cited_as is bytes for an image (never undetermined), text otherwise, envelope for an envelope item", () => {
  assert.equal(contentCitedAs({ kind: "image", part: H }), "bytes");
  assert.equal(contentCitedAs({ kind: "image", page: 0, cited_as: "text" }), "text");
  for (const k of ["document", "pdf-page", "sheet-cell", "doc-para", "slide-shape", "sheet-range", "doc-table"])
    assert.equal(contentCitedAs({ kind: k }), "text");
  assert.equal(contentCitedAs({ kind: "envelope" }), "envelope");
  assert.equal(code(checkContentExtent({ kind: "doc-para", para: 0, cited_as: "bytes" }, ctxOf())), "CONTENT_EXTENT_UNREADABLE");
});

test("R5: a citation naming no part is document; citationContentId answers a 64-hex id, else null", () => {
  assert.deepEqual(citationExtent({ target: "INFO-1" }), { kind: "document" });
  assert.deepEqual(citationExtent({ target: "INFO-1", extent_kind: "" }), { kind: "document" });
  assert.deepEqual(citationExtent({ target: "INFO-1", extent_kind: "pdf-page", extent_page: 3 }), { kind: "pdf-page", page: 3 });
  assert.deepEqual(citationExtent({ target: "INFO-1", extent: { kind: "doc-para", para: 2 } }), { kind: "doc-para", para: 2 });
  assert.equal(citationContentId({ content_id: ` ${H} ` }), H);
  for (const v of [undefined, null, "", "abc", H.toUpperCase(), 7]) assert.equal(citationContentId({ content_id: v }), null);
});

test("R6: extentRelation answers same, narrower, wider, disjoint or unreadable", () => {
  const P = (page, rect) => ({ kind: "pdf-page", page, ...(rect ? { rect } : {}) });
  assert.equal(extentRelation(P(1), P(1)), "same");
  assert.equal(extentRelation({ kind: "document" }, P(1)), "narrower");
  assert.equal(extentRelation(P(1), { kind: "document" }), "wider");
  assert.equal(extentRelation(P(1), P(1, [0, 0, 5, 5])), "narrower");
  assert.equal(extentRelation(P(1, [0, 0, 10, 10]), P(1, [1, 1, 5, 5])), "narrower");
  assert.equal(extentRelation(P(1, [1, 1, 5, 5]), P(1, [0, 0, 10, 10])), "wider");
  assert.equal(extentRelation(P(1, [0, 0, 5, 5]), P(1, [4, 4, 9, 9])), "disjoint");
  assert.equal(extentRelation(P(1), P(2)), "disjoint");
  assert.equal(extentRelation(P(1), { kind: "doc-para", para: 1 }), "disjoint");
  assert.equal(extentRelation({ kind: "doc-para", para: 1 }, { kind: "doc-para", para: 1, run: 2 }), "narrower");
  assert.equal(extentRelation({ kind: "slide-shape", slide: 2 }, { kind: "slide-shape", slide: 2, shape: 0 }), "narrower");
  assert.equal(extentRelation({ kind: "sheet-cell", sheet: "S" }, { kind: "sheet-cell", sheet: "S", cell: "A1" }), "narrower");
  assert.equal(extentRelation({ kind: "dom" }, P(1)), "unreadable");
  assert.equal(extentRelation(null, P(1)), "unreadable");
  assert.equal(extentRelation({ kind: "pdf-page" }, P(1, [0, 0, 1, 1])), "unreadable", "a coarse field missing");
  const env = { kind: "envelope", item: "comment", part: "word/comments.xml", n: 0 };
  assert.equal(extentRelation(env, { ...env }), "same");
  assert.equal(extentRelation({ kind: "document" }, env), "narrower");
  assert.equal(extentRelation(env, { ...env, n: 1 }), "disjoint");
});

test("R7: checkContentExtent refuses what the context bounds, with the figure in detail (C-45.1, C-45.2, C-45.11, C-45.12)", () => {
  const out = (e, c) => { const r = checkContentExtent(e, ctxOf(c)); assert.equal(code(r), "CONTENT_EXTENT_OUT_OF_RANGE", JSON.stringify(e)); assert.equal(r.check, "C-45.1"); return r; };
  assert.match(out({ kind: "pdf-page", page: 3 }, { pageCount: 3 }).detail, /3 page/);
  out({ kind: "sheet-cell", sheet: "Nope", cell: "A1" }, { container: { sheets: [{ name: "S", rows: 10, cols: 5 }] } });
  assert.match(out({ kind: "sheet-cell", sheet: "S", cell: "A11" }, { container: { sheets: [{ name: "S", rows: 10, cols: 5 }] } }).detail, /10 row/);
  assert.equal(checkContentExtent({ kind: "sheet-cell", sheet: "S", cell: "A10" },
    ctxOf({ container: { sheets: [{ name: "S", rows: 10, cols: 5, usedRows: 2 }] } })), null, "an empty cell exists: the grid, never the used range");
  out({ kind: "doc-para", para: 4 }, { container: { paragraphs: 4 } });
  out({ kind: "slide-shape", slide: 3 }, { container: { slides: [{ shapes: 2 }, { shapes: 2 }] } });
  out({ kind: "slide-shape", slide: 1, shape: 2 }, { container: { slides: [{ shapes: 2 }] } });
  out({ kind: "doc-table", table: 1 }, { container: { tables: [{ rows: 2, cols: 2 }] } });
  out({ kind: "image", part: H, cited_as: "bytes" }, { container: { office: true, images: [{ part: "b".repeat(64) }] } });
  const nc = checkContentExtent({ kind: "pdf-page", page: 0 }, { chain: null, pageCount: 2, container: {} });
  assert.equal(code(nc), "CONTENT_EXTENT_NO_CHAIN"); assert.equal(nc.check, "C-45.2");
  assert.equal(checkContentExtent({ kind: "document" }, { chain: null, pageCount: 2, container: {} }), null, "a whole document needs no chain");
  const notc = checkContentExtent({ kind: "image", part: H, cited_as: "bytes" }, ctxOf({ container: { office: false, format: "pdf" } }));
  assert.equal(code(notc), "CONTENT_EXTENT_NOT_A_CONTAINER"); assert.equal(notc.check, "C-45.11");
  const unp = checkContentExtent({ kind: "image", page: 0, rect: [0, 0, 1, 1] },
    ctxOf({ pageCount: 2, container: { container_name: "pdf", images: [{ page: 1, rect: [0, 0, 1, 1] }] } }));
  assert.equal(code(unp), "CONTENT_EXTENT_NO_IMAGE_PAINTED"); assert.equal(unp.check, "C-45.12");
  /* A bound the context does not hold is not a refusal. */
  for (const e of [{ kind: "pdf-page", page: 99 }, { kind: "sheet-cell", sheet: "Any", cell: "ZZ9" }, { kind: "doc-para", para: 99 },
                   { kind: "slide-shape", slide: 99 }, { kind: "doc-table", table: 99 }])
    assert.equal(checkContentExtent(e, ctxOf()), null, JSON.stringify(e));
  /* the catalogue's document-only pass skips every record arm */
  assert.equal(checkContentExtent({ kind: "pdf-page", page: 99 }, CONTENT_EXTENT_DOCUMENT_ONLY), null);
});

test("R8: an extent admitted without its bound held answers exactly one undetermined {level, why}", () => {
  const u1 = mintUndetermined({ kind: "image", part: H, cited_as: "bytes" }, ctxOf({ container: { office: null, kind_why: "unknown kind" } }));
  assert.deepEqual(Object.keys(u1).sort(), ["level", "why"]); assert.equal(u1.level, "container_kind");
  assert.equal(mintUndetermined({ kind: "image", part: H, cited_as: "bytes" }, ctxOf({ container: { office: true } })).level, "image_list");
  assert.equal(mintUndetermined({ kind: "image", page: 0 }, ctxOf({ container: { page_images_why: "no list held" } })).level, "page_images");
  assert.equal(mintUndetermined({ kind: "pdf-page", page: 0, rect: [0, 0, 1, 1] }, ctxOf({ pageBoxes: null })).level, "page_box");
  assert.equal(mintUndetermined({ kind: "pdf-page", page: 0 }, ctxOf()), null, "no rect: nothing unheld");
  assert.equal(mintUndetermined({ kind: "image", part: H, cited_as: "bytes" }, ctxOf({ container: { office: true, images: [] } })), null);
});

test("R9: a pdf-page rect is bounded by its page's MediaBox, refused C-45.1 naming the box; no box held is undetermined, stated", () => {
  const boxes = { boxes: [{ media_box: [0, 0, 612, 792], rotate: 90 }, { media_box: [0, 0, 100, 100] }], of_page: [0, 1, null] };
  const c = ctxOf({ pageCount: 3, pageBoxes: boxes });
  const off = checkContentExtent({ kind: "pdf-page", page: 0, rect: [0, 0, 999999, 999999] }, c);
  assert.equal(code(off), "CONTENT_EXTENT_OUT_OF_RANGE");
  assert.match(off.detail, /MediaBox \[0, 0, 612, 792\]/); assert.match(off.detail, /rotated 90/);
  assert.equal(code(checkContentExtent({ kind: "pdf-page", page: 1, rect: [50, 50, 101, 60] }, c)), "CONTENT_EXTENT_OUT_OF_RANGE", "overlapping is off the page");
  assert.equal(checkContentExtent({ kind: "pdf-page", page: 0, rect: [612.0005, 0, 0, 792] }, c), null, "flush to 0.001 pt");
  assert.equal(checkContentExtent({ kind: "pdf-page", page: 1, rect: [10, 10, 20, 20] }, c), null);
  assert.equal(checkContentExtent({ kind: "pdf-page", page: 2, rect: [0, 0, 9e9, 9e9] }, c), null, "no box for that page: admitted");
  assert.match(mintUndetermined({ kind: "pdf-page", page: 2, rect: [0, 0, 1, 1] }, c).why, /MediaBox for page 2/);
  assert.equal(mintUndetermined({ kind: "pdf-page", page: 1, rect: [0, 0, 1, 1] }, c), null);
  assert.equal(pageBoxesOf({ boxes: [{ media_box: [0, 0, 0, 5] }], of_page: [0] }), null, "a box enclosing no area makes the whole list unheld");
  assert.equal(checkContentExtent({ kind: "pdf-page", page: 0, rect: [0, 0, 9e9, 9e9] }, CONTENT_EXTENT_DOCUMENT_ONLY), null);
});

test("R10: a rect states its space; only user space is addressed, and any other is refused C-45.13, never read as user space", () => {
  for (const kind of ["pdf-page", "image"]) {
    const r = checkContentExtent({ kind, page: 0, rect: [0, 0, 5, 5], space: "image-px" }, ctxOf({ pageCount: 1 }));
    assert.equal(code(r), "CONTENT_EXTENT_NOT_USER_SPACE"); assert.equal(r.check, "C-45.13");
    assert.equal(r.translation, CONTENT_EXTENT_OWN_CHECKS.CONTENT_EXTENT_NOT_USER_SPACE.translation);
  }
  assert.equal(checkContentExtent({ kind: "pdf-page", page: 0, rect: [0, 0, 5, 5], space: "user" }, ctxOf()), null);
  assert.equal(canonicalExtent({ kind: "pdf-page", page: 0, rect: [0, 0, 5, 5], space: "user" }),
               canonicalExtent({ kind: "pdf-page", page: 0, rect: [0, 0, 5, 5] }), "unstated is user space: one address");
  assert.deepEqual(citationExtent({ target: "INFO-1", extent_kind: "pdf-page", extent_page: 0, extent_rect: [0, 0, 1, 1], extent_space: "image-px" }).space, "image-px");
  assert.equal(extentRelation({ kind: "pdf-page", page: 0, rect: [0, 0, 9, 9] }, { kind: "pdf-page", page: 0, rect: [1, 1, 2, 2], space: "image-px" }), "unreadable");
});

test("R33: an office document's envelope items are citable through an envelope extent, never as the body", () => {
  assert.deepEqual(Object.keys(ENVELOPE_ITEM_KINDS).sort(), ["comment", "core-property", "speaker-note", "tracked-change"]);
  const c = ctxOf({ container: { paragraphs: 5 } });
  const ok = { kind: "envelope", item: "comment", part: "word/comments.xml", at: { kind: "doc-para", para: 2 }, n: 0 };
  assert.equal(checkContentExtent(ok, c), null);
  assert.equal(checkContentExtent({ kind: "envelope", item: "core-property", part: "docProps/core.xml", name: "creator", n: 0 }, c), null);
  const bad = (e) => assert.equal(code(checkContentExtent(e, c)), "CONTENT_EXTENT_UNREADABLE", JSON.stringify(e));
  bad({ ...ok, item: "formula" });
  bad({ ...ok, part: "" });
  bad({ ...ok, n: -1 });
  bad({ kind: "envelope", item: "core-property", part: "docProps/core.xml", n: 0 });
  bad({ ...ok, at: { kind: "sheet-cell", sheet: "S", cell: "A1" } });
  bad({ ...ok, cited_as: "text" });
  bad({ kind: "doc-para", para: 1, cited_as: "envelope" });
  assert.equal(code(checkContentExtent({ ...ok, at: { kind: "doc-para", para: 9 } }, c)), "CONTENT_EXTENT_OUT_OF_RANGE", "its anchor is an address");
  assert.equal(code(checkContentExtent(ok, { chain: null, pageCount: null, container: {} })), "CONTENT_EXTENT_NO_CHAIN");
  assert.match(describeExtent(ok), /^envelope: a comment at ¶3$/);
  assert.equal(contentCitedAs(ok), "envelope");
  assert.notEqual(canonicalExtent(ok), canonicalExtent({ ...ok, n: 1 }), "two comments on one paragraph are two items");
  assert.notEqual(contentIdFor("c", ok, null), contentIdFor("c", { ...ok, item: "tracked-change" }, null));
  assert.match(canonicalExtent(ok), /"cited_as":"envelope"/);
});

test("R14: a unit's chain kind is how its extent was read: the page's covering steps, mixed where they differ", () => {
  const MIXED = [
    { step: "layer", tier: 1, extent: { kind: "pages", pages: [0, 1] } },
    { step: "pixels", tier: 3, cap: "C", extent: { kind: "pages", pages: [2] } },
    { step: "ocr", engine: "t", version: "5", tier: 3, cap: "C", extent: { kind: "pages", pages: [2] } },
  ];
  assert.equal(unitChainKind(MIXED, unitTargetOf({ kind: "pdf-page", page: 0 })), "layer");
  assert.equal(unitChainKind(MIXED, unitTargetOf({ kind: "pdf-page", page: 2 })), "ocr");
  assert.equal(unitChainKind(MIXED, unitTargetOf({ kind: "document" })), "mixed", "a whole-document unit of a mixed document");
  assert.equal(unitChainKind([{ step: "layer", tier: 1 }, { step: "ocr", engine: "t" }], unitTargetOf({ kind: "document" })), "ocr");
  assert.equal(unitChainKind(null, null), null);
  assert.equal(unitChainKind(MIXED, unitTargetOf({ kind: "pdf-page", page: 7 })), null, "no step covers the page");
  assert.equal(unitChainKind([{ step: "typed", member: "m", text_sha256: "x" }], null), "typed");
});

test("R40: no place is named in this module's behaviour or outward text", () => {
  const dir = fileURLToPath(new URL("../../../src/content/", import.meta.url));
  for (const f of readdirSync(dir)) {
    const text = readFileSync(dir + f, "utf8");
    assert.doesNotMatch(text, /\b(Oakland|Alameda|Berkeley|California)\b/i, f);
  }
});
