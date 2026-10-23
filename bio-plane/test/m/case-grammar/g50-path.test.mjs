/* case-grammar at its interface, fix round 6, G50 (requirements R13 and R14): a `ref` that two or more rows of the case
   document's `materials:` block state is two captures of one source, and its four per-ref kinds of file are spelled under
   the row's capture, `materials/<ref>/<sha256>/<leaf>`, in a case file that declares `bio-case-file/4`. Every other case
   file keeps `/3` and its bytes. Each clause has its own test and its negative controls (K874); the stored `/3` case files
   g1 and g2 (`./g50-old-goldens.json`, recorded at the G50 base by `./make-g50-goldens.mjs`) read and render byte for
   byte, g1's `original_carried` included (R-OLD). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { caseDocument, manifestFor, editionInput, OBSCURED_LABEL } from "./casefile-fixture.mjs";
import { sha } from "./helpers.mjs";

const V4 = "bio-case-file/4";
const V3 = "bio-case-file/3";
const fmOf = (text) => parseFrontmatter(text).data;
const bytesOf = (s) => Buffer.byteLength(s, "utf8");
const R = "INFO-2026-0004-photo";
const SIG = "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n";
const A_BYTES = "JPEG the first capture's original, faces visible";
const B_BYTES = "%PDF the second capture of the same source";
const A_COPY = "JPEG the first copy, faces covered";
const B_COPY = "%PDF-1.7 the second copy, cleaned of its details";
const A = sha(A_BYTES);
const B = sha(B_BYTES);

const copyRow = (bytes, copy, over = {}) => ({ ref: R, kind: "document", sha: sha(bytes), text_sha: null, origin: "a member's capture",
  archived_copy: null, included: false, rests_under: "load_bearing", obscured: { copy: sha(copy), label: OBSCURED_LABEL }, ...over });
const wholeRow = (bytes, text, over = {}) => ({ ref: R, kind: "document", sha: sha(bytes), text_sha: sha(text), origin: "a member's capture",
  archived_copy: null, included: true, rests_under: "load_bearing", ...over });
const rowA = copyRow(A_BYTES, A_COPY);
const rowB = copyRow(B_BYTES, B_COPY);

/* the fixture's case document with its `materials:` block replaced by `rows` (no attestations) */
function documentWith(rows) {
  const out = [];
  let skipping = false;
  for (const line of caseDocument().split("\n")) {
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

/** A case file over `rows`: the case document, its signature and the `files` handed ([path, text]), listed in `format`; `raw`
    adds listed entries as they are. `rows` as `materialsOf` reads them back are returned for the check. */
function build({ rows, files = [], format = V4, raw = [], edition = "x" }) {
  const text = new Map([["case.md", documentWith(rows)], ["case.md.sig", SIG], ...files]);
  const list = (m) => [...m].map(([path, t]) => ({ path, sha256: sha(t), bytes: bytesOf(t), part: 1, kind: CG.caseFileEntryOf(path).kind }));
  const over = { format };
  if (edition === null) text.set("complete-edition.html", CG.completeEditionOf(editionInput(manifestFor(list(text), over), text)));
  else text.set("complete-edition.html", edition);
  const manifest = manifestFor([...list(text), ...raw], over);
  return { manifest, text, rows: CG.materialsOf(fmOf(text.get("case.md"))).materials };
}
const at = (kind, ref, capture) => CG.caseFilePath(kind, [ref, capture]);
const rulesOf = (m, rows) => CG.caseFileManifestCheck(m, rows === undefined ? undefined : { materials: rows }).map((d) => d.rule);

const TWO_COPIES = [[at("obscured", R, A), A_COPY], [at("obscured", R, B), B_COPY]];

/* ===== R13: the paths ===== */

test("R13 G50 caseFilePath with [ref, sha] spells the four material kinds under the capture, the sha lower-cased; a bad ref, a short sha or a non-hex sha is null; a ref alone spells as before", () => {
  const leaf = { document: "document", extracted_text: "extracted.txt", observation: "observation.md", obscured: "obscured" };
  for (const [kind, name] of Object.entries(leaf)) {
    assert.equal(CG.caseFilePath(kind, [R, A]), `materials/${R}/${A}/${name}`, kind);
    assert.equal(CG.caseFilePath(kind, [R, A.toUpperCase()]), `materials/${R}/${A}/${name}`, `${kind}: an upper-case sha is spelled lower-cased`);
    assert.equal(CG.caseFilePath(kind, R), `materials/${R}/${name}`, `${kind}: a ref alone is spelled as before`);
    for (const key of [["../x", A], ["", A], ["a/b", A], [R, A.slice(1)], [R, `${A.slice(1)}g`], [R, ""], [R, null], [R, 7], [R], [R, A, 1],
                       [R, `${A}0`], [null, A], [undefined, undefined]])
      assert.equal(CG.caseFilePath(kind, key), null, `${kind} ${JSON.stringify(key)}`);
  }
  /* the other keyed kinds are untouched: an attestation by name, an archive and a container by digest alone */
  assert.equal(CG.caseFilePath("attestation", [R, "account-1.txt"]), `attestations/${R}/account-1.txt`);
  assert.equal(CG.caseFilePath("archive", [R, A]), `materials/${R}/archives/${A}`);
  assert.equal(CG.caseFilePath("archive", [R, A.toUpperCase()]), null, "an archive is named by its own lower-case digest");
  assert.equal(CG.caseFilePath("container", [R, A]), `materials/${R}/containers/${A}.json`);
  assert.equal(CG.caseFilePath("finding", [R, A]), null);
});

test("R13 G50 caseFileEntryOf reads a path under a capture back as {kind, ref, capture}, every plain and chain path as before; materials/R/<hex>/archives and materials/R/archives/<hex> do not cross-parse", () => {
  for (const kind of ["document", "extracted_text", "observation", "obscured"]) {
    assert.deepEqual(CG.caseFileEntryOf(at(kind, R, A)), { kind, ref: R, capture: A }, kind);
    assert.deepEqual(CG.caseFileEntryOf(CG.caseFilePath(kind, R)), { kind, ref: R }, `${kind}: a plain path states no capture`);
  }
  assert.deepEqual(CG.caseFileEntryOf(`materials/${R}/archives/${A}`), { kind: "archive", ref: R, archive: A });
  assert.deepEqual(CG.caseFileEntryOf(`materials/${R}/containers/${A}.json`), { kind: "container", ref: R, member: A });
  assert.equal(CG.caseFileEntryOf(`materials/${R}/${A}/archives`), null, "a capture directory holds no archive");
  assert.equal(CG.caseFileEntryOf(`materials/${R}/${A}/${A}`), null);
  assert.equal(CG.caseFileEntryOf(`materials/${R}/archives/document`), null);
  assert.equal(CG.caseFileEntryOf(`materials/${R}/containers/${A}/document`), null);
  for (const path of [`materials/${R}/${A.toUpperCase()}/document`, `materials/${R}/${A.slice(1)}/document`, `materials/${R}/${A}/obscured.jpg`,
                      `materials/${R}/${A}/attestation`, `materials/${R}/${A}/document/x`, `materials/../${A}/document`, `materials/${R}/${A}`,
                      `findings/${R}/${A}/document`, `attestations/${R}/${A}/document`])
    assert.equal(CG.caseFileEntryOf(path), null, path);
});

test("R13 G50 caseFileFormatFor declares /4 for a case file with a path under a capture and /3 for every other; materialFileKey spells [ref, sha] under /4 for a ref on several rows and the ref alone otherwise", () => {
  assert.equal(CG.CASE_FILE_FORMAT_V4, V4);
  assert.equal(CG.CASE_FILE_FORMAT, V3, "the format written when no path states a capture");
  assert.equal(CG.caseFileFormatFor([]), V3);
  assert.equal(CG.caseFileFormatFor(["case.md", `materials/${R}/document`, `materials/${R}/obscured`, `materials/${R}/archives/${A}`,
                                     `materials/${R}/containers/${A}.json`, `findings/INQ-1/finding.md`]), V3);
  assert.equal(CG.caseFileFormatFor(["case.md", at("obscured", R, A)]), V4);
  assert.equal(CG.caseFileFormatFor(new Set([`materials/${R}/document`, at("document", R, B)])), V4, "any one path");
  for (const odd of [null, undefined, 7, "x", {}, [null, 7, {}], { [Symbol.iterator]() { throw new Error("boom"); } }])
    assert.doesNotThrow(() => CG.caseFileFormatFor(odd));
  assert.equal(CG.caseFileFormatFor(null), V3);
  /* materialFileKey */
  const several = CG.refsOnSeveralRows([rowA, rowB, { ...rowA, ref: "INFO-2026-0005-one" }]);
  assert.deepEqual(CG.materialFileKey(rowA, several, V4), [R, A]);
  assert.deepEqual(CG.materialFileKey({ ...rowA, sha: A.toUpperCase() }, several, V4), [R, A], "lower-cased");
  assert.equal(CG.materialFileKey(rowA, several, V3), R, "the discriminated spelling is /4's alone");
  for (const f of [undefined, "bio-case-file/2", "bio-case-file/1", "bio-case-file/5", null]) assert.equal(CG.materialFileKey(rowA, several, f), R, String(f));
  assert.equal(CG.materialFileKey({ ...rowA, ref: "INFO-2026-0005-one" }, several, V4), "INFO-2026-0005-one", "a ref on one row keeps its plain path");
  assert.equal(CG.materialFileKey(rowA, true, V4)[0], R);
  assert.equal(CG.caseFilePath("obscured", CG.materialFileKey({ ...rowA, sha: "not hex" }, several, V4)), null, "a non-hex sha spells nothing");
  assert.equal(CG.caseFilePath("obscured", CG.materialFileKey({ ...rowA, sha: null }, several, V4)), null);
  for (const odd of [null, undefined, 7, "x", {}, { ref: 7 }, { get ref() { throw new Error("boom"); } }]) assert.doesNotThrow(() => CG.materialFileKey(odd, several, V4));
  assert.equal(CG.materialFileKey({}, several, V4), null);
});

test("R13 G50 refsOnSeveralRows counts a ref over every row, carried as its copy or not; an odd row or ref is never counted; it never throws", () => {
  const whole = wholeRow(B_BYTES, "b");
  assert.deepEqual([...CG.refsOnSeveralRows([rowA, rowB])], [R], "two copies");
  assert.deepEqual([...CG.refsOnSeveralRows([rowA, whole])], [R], "a copy beside an included row");
  assert.deepEqual([...CG.refsOnSeveralRows([whole, { ...whole, included: false, sha: sha("x") }])], [R], "an included and an excluded row");
  assert.deepEqual([...CG.refsOnSeveralRows([rowA, { ...rowB, ref: "INFO-2026-0005-one" }])], [], "one row each");
  assert.deepEqual([...CG.refsOnSeveralRows([rowA, rowA, { ...rowA, ref: "Z" }, { ...rowA, ref: "Z" }, { ...rowA, ref: "Z" }])].sort(), [R, "Z"].sort());
  assert.deepEqual([...CG.refsOnSeveralRows([null, 7, "x", { ref: 7 }, { ref: 7 }, {}, {}, [], { ref: null }, { ref: null }])], []);
  for (const odd of [null, undefined, 7, "x", {}, [{ get ref() { throw new Error("boom"); } }]]) assert.ok(CG.refsOnSeveralRows(odd) instanceof Set);
});

/* ===== R13: the check ===== */

test("R13 G50 a /4 case file with two copies of one ref, each under its row's capture, meets the rule; a /3 file with two copies at one path still departs path_twice", () => {
  const f = build({ rows: [rowA, rowB], files: TWO_COPIES });
  assert.equal(f.manifest.format, V4);
  assert.deepEqual(f.manifest.files.filter((x) => x.kind === "obscured").map((x) => x.path), [at("obscured", R, A), at("obscured", R, B)].sort());
  assert.deepEqual(CG.caseFileManifestCheck(f.manifest, { materials: f.rows }), []);
  assert.deepEqual(CG.caseFileManifestCheck(f.manifest), [], "the manifest alone");
  assert.equal(f.rows.length, 2);
  /* a /3 file has one path for both copies: listed twice, as a writer that did not discriminate would have written it */
  const plain = CG.caseFilePath("obscured", R);
  const v3 = build({ rows: [rowA, rowB], format: V3, files: [[plain, A_COPY]], raw: [{ path: plain, sha256: sha(B_COPY), bytes: bytesOf(B_COPY), part: 1, kind: "obscured" }] });
  assert.equal(rulesOf(v3.manifest, v3.rows).includes("path_twice"), true);
  assert.equal(rulesOf(v3.manifest).includes("path_twice"), true, "without the rows");
  assert.equal(rulesOf(v3.manifest, v3.rows).includes("path_format"), false, "and no capture is stated in it");
});

test("R13 G50 path_format: a path under a capture in a manifest of another format departs, each named; format_unused: a /4 manifest with no such path departs", () => {
  const f = build({ rows: [rowA, rowB], files: TWO_COPIES });
  for (const format of [V3, "bio-case-file/2", "bio-case-file/1"]) {
    const m = { ...f.manifest, format };
    const got = CG.caseFileManifestCheck(m, { materials: f.rows }).filter((d) => d.rule === "path_format");
    assert.equal(got.length, 2, `${format}: one per file`);
    assert.deepEqual(got.map((d) => d.at), got.map((d) => d.at).sort());
    for (const capture of [A, B]) assert.equal(got.some((d) => d.detail.includes(at("obscured", R, capture))), true, `${format}: ${capture}`);
    assert.equal(got.every((d) => d.detail.includes(format)), true, `${format}: names the format it is under`);
    assert.equal(rulesOf(m).includes("path_format"), true, `${format}: without the rows`);
  }
  /* an unaccepted format departs at format, and is read as /3 for the rest */
  assert.deepEqual(rulesOf({ ...f.manifest, format: "bio-case-file/5" }, f.rows).filter((r) => ["format", "path_format"].includes(r)), ["format", "path_format", "path_format"]);
  /* format_unused */
  const unused = build({ rows: [rowA], files: [[CG.caseFilePath("obscured", R), A_COPY]], format: V4 });
  assert.deepEqual(rulesOf(unused.manifest, unused.rows), ["format_unused"]);
  assert.deepEqual(rulesOf(unused.manifest), ["format_unused"], "without the rows");
  assert.equal(CG.caseFileManifestCheck(unused.manifest)[0].at, "format");
  /* controls: a /3 file with plain paths only, and a /4 file with a path under a capture, answer neither */
  for (const m of [build({ rows: [rowA], files: [[CG.caseFilePath("obscured", R), A_COPY]], format: V3 }).manifest, f.manifest])
    assert.equal(rulesOf(m).some((r) => ["path_format", "format_unused"].includes(r)), false);
});

test("R13 G50 capture_missing, capture_needless and capture_unnamed are answered from the rows under /4: a plain path of a ref on several rows, a path under a capture for a ref on one row, a capture no row of that ref names (compared lower-cased)", () => {
  const whole = wholeRow(B_BYTES, "b text");
  const ok = build({ rows: [rowA, whole], files: [[at("obscured", R, A), A_COPY], [at("document", R, B), B_BYTES], [at("extracted_text", R, B), "b text"]] });
  assert.deepEqual(rulesOf(ok.manifest, ok.rows), [], "a copy beside an included document, each under its capture");
  /* capture_missing: a plain per-ref path of a ref on two rows, for each of the four kinds */
  for (const [kind, leafText] of [["document", B_BYTES], ["extracted_text", "b text"], ["observation", "obs"], ["obscured", A_COPY]]) {
    const f = build({ rows: [rowA, whole], files: [[at("obscured", R, A), A_COPY], [CG.caseFilePath(kind, R), leafText]] });
    const got = CG.caseFileManifestCheck(f.manifest, { materials: f.rows }).filter((d) => d.rule === "capture_missing");
    assert.equal(got.length, 1, kind);
    assert.match(got[0].detail, new RegExp(CG.caseFilePath(kind, R)));
  }
  /* capture_needless: a path under a capture for a ref on one row; the rest of the rule holds */
  const one = build({ rows: [rowA], files: [[at("obscured", R, A), A_COPY]] });
  assert.deepEqual(rulesOf(one.manifest, one.rows), ["capture_needless"]);
  assert.equal(CG.caseFileManifestCheck(one.manifest, { materials: one.rows })[0].at, `files[${one.manifest.files.findIndex((x) => x.kind === "obscured")}].path`);
  /* capture_unnamed: a capture no row of that ref names; a ref no row names at all */
  const stray = build({ rows: [rowA, rowB], files: [...TWO_COPIES, [at("document", R, sha("a third capture")), "bytes"]] });
  assert.deepEqual(rulesOf(stray.manifest, stray.rows), ["capture_unnamed"]);
  const noRef = build({ rows: [rowA, rowB], files: [...TWO_COPIES, [at("document", "INFO-2026-0077-gone", A), "bytes"]] });
  assert.deepEqual(rulesOf(noRef.manifest, noRef.rows), ["capture_unnamed"]);
  /* compared lower-cased: a row whose sha is written in upper case matches its lower-case path, and no departure is answered */
  const upper = [{ ...rowA, sha: A.toUpperCase() }, { ...rowB, sha: B.toUpperCase() }];
  const u = build({ rows: upper, files: TWO_COPIES });
  assert.equal(u.rows[0].sha, A.toUpperCase(), "the row states an upper-case sha");
  assert.deepEqual(rulesOf(u.manifest, u.rows), []);
  /* the manifest alone judges none of the three, and a /3 manifest answers none of them (path_format says so) */
  assert.deepEqual(rulesOf(stray.manifest), []);
  const v3 = { ...stray.manifest, format: V3 };
  assert.equal(rulesOf(v3, stray.rows).some((r) => r.startsWith("capture_")), false);
});

test("R13 G50 the three copy rules are judged by (ref, capture) where a path states one: a copy beside an included document of one ref is no departure, the copy's own original is; a copy under another row's capture is unnamed", () => {
  const whole = wholeRow(B_BYTES, "b text");
  const docs = [[at("document", R, B), B_BYTES], [at("extracted_text", R, B), "b text"]];
  /* obscured_unnamed / original_carried, by row */
  const g = build({ rows: [rowA, whole], files: [[at("obscured", R, A), A_COPY], ...docs] });
  assert.deepEqual(rulesOf(g.manifest, g.rows), [], "the included row's document is not its sibling's original");
  const carried = build({ rows: [rowA, whole], files: [[at("obscured", R, A), A_COPY], ...docs, [at("document", R, A), A_BYTES], [at("extracted_text", R, A), "a text"]] });
  assert.deepEqual(rulesOf(carried.manifest, carried.rows), ["original_carried", "original_carried"], "A's own original never travels");
  const crossed = build({ rows: [rowA, rowB], files: [[at("obscured", R, A), B_COPY], [at("obscured", R, B), A_COPY]] });
  assert.deepEqual(rulesOf(crossed.manifest, crossed.rows).sort(), ["obscured_copy_missing", "obscured_copy_missing", "obscured_unnamed", "obscured_unnamed"],
                   "each copy under the other row's capture is named by no row and carries nobody's");
  const named = build({ rows: [rowA, rowB], files: [[at("obscured", R, A), A_COPY]] });
  assert.deepEqual(rulesOf(named.manifest, named.rows), ["obscured_copy_missing"], "one copy not carried: that row alone");
  assert.match(CG.caseFileManifestCheck(named.manifest, { materials: named.rows })[0].detail, new RegExp(sha(B_COPY)));
  /* the archive and container rule: only when every row of that ref is a copy */
  const chain = [[CG.caseFilePath("archive", [R, sha("zip")]), "zip"], [CG.caseFilePath("container", [R, A]), "record"]];
  const mixed = build({ rows: [rowA, whole], files: [[at("obscured", R, A), A_COPY], ...docs, ...chain] });
  assert.deepEqual(rulesOf(mixed.manifest, mixed.rows), [], "a copy beside an included row: the chain is the included row's");
  const bothCopies = build({ rows: [rowA, rowB], files: [...TWO_COPIES, ...chain] });
  assert.deepEqual(rulesOf(bothCopies.manifest, bothCopies.rows).filter((r) => r !== "chain_without_document"), ["original_carried", "original_carried"],
                   "every row of the ref is a copy: the archive and the container are originals");
  /* a /3 file is judged by ref alone, as it always was (R-OLD): the archive under a ref with one copy departs */
  assert.equal(rulesOf({ ...mixed.manifest, format: V3 }, mixed.rows).includes("original_carried"), true);
});

test("R13 G50 a ref on several rows whose sha is not 64 hex has no capture to spell: its files are absent, and the check answers by the row's kind", () => {
  const odd = (over) => ({ ...wholeRow("w", "t"), sha: "not a sha", ...over });
  const sibling = copyRow(A_BYTES, A_COPY);
  const base = [[at("obscured", R, A), A_COPY]];
  /* an included document row: no file is asked for by the rows */
  const included = build({ rows: [sibling, odd()], files: base });
  assert.deepEqual(rulesOf(included.manifest, included.rows), []);
  /* an excluded row: no file either way */
  const excluded = build({ rows: [sibling, odd({ included: false })], files: base });
  assert.deepEqual(rulesOf(excluded.manifest, excluded.rows), []);
  /* an observation row: its observation file absent, nothing departs */
  const observation = build({ rows: [sibling, odd({ kind: "observation" })], files: base });
  assert.deepEqual(rulesOf(observation.manifest, observation.rows), []);
  /* a copied row whose original sha is invalid: its copy cannot be carried, so exactly that row's copy is missing */
  const copied = build({ rows: [sibling, copyRow("x", "y", { sha: "not a sha" })], files: base });
  assert.deepEqual(rulesOf(copied.manifest, copied.rows), ["obscured_copy_missing"]);
  assert.match(CG.caseFileManifestCheck(copied.manifest, { materials: copied.rows })[0].detail, new RegExp(sha("y")));
});

test("R13 G50 the format departure names the accepted list (the reworded row), and the five new departures each carry a sentence", () => {
  const f = build({ rows: [rowA, rowB], files: TWO_COPIES });
  assert.deepEqual([...CG.CASE_FILE_FORMATS_ACCEPTED], [V4, V3, "bio-case-file/2", "bio-case-file/1"]);
  const m = { ...f.manifest, format: "bio-case-file/5" };
  const d = CG.caseFileManifestCheck(m).find((x) => x.rule === "format");
  assert.equal(d.at, "format");
  for (const accepted of CG.CASE_FILE_FORMATS_ACCEPTED) assert.equal(d.detail.includes(accepted), true, `names ${accepted}`);
  assert.equal(d.detail.includes(JSON.stringify("bio-case-file/5")), true, "and the format it was handed");
  assert.equal(d.detail.indexOf(V4) < d.detail.indexOf("bio-case-file/1"), true, "newest first");
  /* every departure of the five is named with a sentence, at a place and a rule */
  const seen = new Set();
  const whole = wholeRow(B_BYTES, "b");
  for (const g of [build({ rows: [rowA], files: [[at("obscured", R, A), A_COPY]] }),
                   build({ rows: [rowA, whole], files: [[CG.caseFilePath("document", R), "b"], [at("obscured", R, A), A_COPY]] }),
                   build({ rows: [rowA, rowB], files: [...TWO_COPIES, [at("document", R, sha("c")), "c"]] }),
                   build({ rows: [rowA], files: [[CG.caseFilePath("obscured", R), A_COPY]] }),
                   { manifest: { ...f.manifest, format: V3 }, rows: f.rows }])
    for (const x of CG.caseFileManifestCheck(g.manifest, { materials: g.rows })) {
      seen.add(x.rule);
      assert.equal(typeof x.detail === "string" && x.detail.length > 10 && typeof x.at === "string", true, x.rule);
    }
  for (const rule of ["path_format", "format_unused", "capture_missing", "capture_needless", "capture_unnamed"]) assert.equal(seen.has(rule), true, rule);
  /* pure and never throwing on odd rows */
  const before = JSON.stringify(f.manifest);
  assert.deepEqual(CG.caseFileManifestCheck(f.manifest, { materials: f.rows }), CG.caseFileManifestCheck(f.manifest, { materials: f.rows }));
  assert.equal(JSON.stringify(f.manifest), before);
  const odd = [null, 7, "x", {}, { ref: R, obscured: "x" }, { ref: R, sha: 7, obscured: { copy: A } }, { get ref() { throw new Error("boom"); } }];
  assert.doesNotThrow(() => CG.caseFileManifestCheck(f.manifest, { materials: odd }));
});

/* ===== R14 ===== */

const materialsSection = (html) => html.slice(html.indexOf("<h2>3. "), html.indexOf("<h2>4. "));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const lis = (html, nth) => { const m = materialsSection(html); const heads = [...m.matchAll(/<h3>/g)].map((x) => x.index);
  return [...m.slice(heads[nth], heads[nth + 1] ?? m.length).matchAll(/<li>([^<]*)<\/li>/g)].map((x) => x[1]); };

test("R14 G50 a /4 case file renders each copy's line from its own file: a photo's copy and a cleaned member document's copy of one ref are each listed as what its bytes are", () => {
  const f = build({ rows: [rowA, rowB], files: TWO_COPIES, edition: null });
  assert.equal(f.manifest.format, V4);
  const html = f.text.get("complete-edition.html");
  const photo = esc(`${CG.OBSCURED_WORDS.copy}${sha(A_COPY)}`);
  const cleaned = esc(`${CG.OBSCURED_WORDS.cleaned}${sha(B_COPY)}`);
  assert.equal(lis(html, 0).includes(photo), true, "the first row: its own copy, an image, a photo's line");
  assert.equal(lis(html, 1).includes(cleaned), true, "the second row: its own copy, a PDF, the cleaned-copy line");
  assert.equal(lis(html, 0).some((l) => l.includes(esc(CG.OBSCURED_WORDS.cleaned))), false);
  /* handed in another order, as bytes: the same edition */
  const input = editionInput(f.manifest, f.text);
  assert.equal(CG.completeEditionOf({ ...input, files: [...input.files].reverse() }), html);
  assert.equal(CG.completeEditionOf({ ...input, files: input.files.map((x) => ({ ...x, content: new TextEncoder().encode(x.content) })) }), html);
  /* a row stating a kind is listed by it, whatever the bytes of the copy at its path */
  const stated = documentWith([{ ...rowA, obscured: { ...rowA.obscured, kind: "document" } }, { ...rowB, obscured: { ...rowB.obscured, kind: "photo" } }]);
  const withKinds = new Map(f.text).set("case.md", stated);
  const html2 = CG.completeEditionOf(editionInput(f.manifest, withKinds));
  assert.equal(lis(html2, 0).includes(esc(`${CG.OBSCURED_WORDS.cleaned}${sha(A_COPY)}`)), true);
  assert.equal(lis(html2, 1).includes(esc(`${CG.OBSCURED_WORDS.copy}${sha(B_COPY)}`)), true);
  /* controls: a ref on one row is read at its plain path in a /4 file, and a /3 file's plain path as before */
  const one = build({ rows: [rowB], files: [[CG.caseFilePath("obscured", R), B_COPY]], format: V3, edition: null });
  assert.equal(lis(one.text.get("complete-edition.html"), 0).includes(cleaned), true);
  const asV4 = CG.completeEditionOf(editionInput({ ...one.manifest, format: V4 }, one.text));
  assert.equal(asV4, one.text.get("complete-edition.html"), "a ref on one row keeps its plain path under /4");
  /* a copy not handed under its capture is listed as a photo's, never guessed a document, and nothing throws */
  const bare = editionInput(f.manifest, f.text);
  const without = CG.completeEditionOf({ ...bare, files: bare.files.filter((x) => x.kind !== "obscured") });
  assert.equal(lis(without, 1).some((l) => l.includes(esc(CG.OBSCURED_WORDS.cleaned))), false);
});

const GOLDEN = JSON.parse(readFileSync(new URL("./g50-old-goldens.json", import.meta.url), "utf8"));

/* the two stored /3 case files, made again from the same facts the base script used (`./make-g50-goldens.mjs`) */
const GOLD_ORIGINAL = "JPEG the original, faces visible";
const GOLD_COPY = "JPEG the copy, faces covered";
const GOLD_SECOND = "%PDF the second capture of the same source";
const gold = (rows, files) => build({ rows, files, format: V3, edition: null });
const goldRow = (over) => ({ ref: R, kind: "document", sha: sha(GOLD_ORIGINAL), text_sha: null, origin: "a member's capture", archived_copy: null,
  included: false, rests_under: "load_bearing", ...over });
const G1 = () => gold([goldRow({ obscured: { copy: sha(GOLD_COPY), label: OBSCURED_LABEL } }), goldRow({ sha: sha(GOLD_SECOND), text_sha: sha("second text"), included: true })],
  [[CG.caseFilePath("document", R), GOLD_SECOND], [CG.caseFilePath("extracted_text", R), "second text"], [CG.caseFilePath("obscured", R), GOLD_COPY]]);
const G2 = () => gold([goldRow({ sha: sha(GOLD_SECOND), text_sha: sha("second text"), included: true }), goldRow({ sha: sha("an excluded capture"), included: false })],
  [[CG.caseFilePath("document", R), GOLD_SECOND], [CG.caseFilePath("extracted_text", R), "second text"]]);

test("R13 R14 G50 R-OLD the stored /3 case files g1 and g2 read and render byte for byte as at the G50 base: the same check with and without the rows (g1's original_carried included) and the same complete edition", () => {
  assert.equal(GOLDEN.base, "124e62bfa8");
  for (const [name, make] of [["g1", G1], ["g2", G2]]) {
    const g = GOLDEN[name];
    const f = make();
    assert.equal(g.manifest.format, V3, name);
    const edition = f.text.get("complete-edition.html");
    /* the same files: the manifest is the stored one but for the case document's own bytes, which the fixture's text fixes */
    assert.deepEqual(f.manifest.files.map((x) => x.path), g.manifest.files.map((x) => x.path), `${name}: the same paths`);
    assert.equal(edition, g.complete_edition, `${name}: the complete edition, byte for byte`);
    assert.deepEqual(f.manifest, g.manifest, `${name}: the same manifest`);
    assert.deepEqual(CG.caseFileManifestCheck(g.manifest, { materials: f.rows }), g.check_with_rows, `${name}: the check with the rows`);
    assert.deepEqual(CG.caseFileManifestCheck(g.manifest), g.check_without_rows, `${name}: the check without the rows`);
    assert.equal(CG.completeEditionOf(editionInput(g.manifest, f.text)), g.complete_edition);
  }
  /* the expectation: g1 departs original_carried for the included row's own files, exactly as today; g2 departs nothing */
  assert.deepEqual(GOLDEN.g1.check_with_rows.map((d) => d.rule), ["original_carried", "original_carried"]);
  assert.deepEqual(GOLDEN.g1.check_without_rows, []);
  assert.deepEqual(GOLDEN.g2.check_with_rows, []);
  assert.deepEqual(GOLDEN.g2.check_without_rows, []);
});
