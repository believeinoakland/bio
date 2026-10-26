/* public-read — G50 (fix round 6; `build/plan/fix-round-6-T51.md`): two material rows of one `ref`.
   (A) A court order joins a copy to its original by the copy's OWN hash (`#editionItems`), never by `ref`: with two
   copied rows of one `ref`, an order naming one capture's original withholds that capture's copy and no other. (A) needs
   no provider and is green when it merges (R28). (B) is below (the case file's paths); it is red by name until
   CASE-GRAMMAR #21 merges.
   The case is built by the Worker's real assembly over the member's rows; the copies are registered as `publication`
   R57 registers them and their bytes put where `ratification` R39 puts them (as `obscured.test.mjs` stands in for both). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, stubOf, bucket, NOW } from "./fixture.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { caseFilePath, caseFileManifestCheck, completeEditionOf, materialsOf } from "../../../src/case-grammar/index.mjs";
import * as G from "../../../src/case-grammar/index.mjs";
import { buildCaseFile } from "../../../src/public-read/casefile.mjs";
import { inbandQuartet } from "../../../src/inband.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { buildScene } from "./g50-scenes.mjs";
import { readFileSync } from "node:fs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const call = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};
const enc = (s) => new TextEncoder().encode(s);
const hex = (b) => createHash("sha256").update(b).digest("hex");

const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
const PHOTO = "INFO-2026-0020-photo", DOC = "INFO-2026-0001-minutes";
const LABEL = "Faces and plates obscured for publication; the team holds the original";
const COPY_A = enc("capture A's photo, its marked areas covered"), COPY_B = enc("capture B's photo, its marked areas covered");
const CA = hex(COPY_A), CB = hex(COPY_B);
const ORIG_B = hex(enc("the original of capture B, held by the team and never published"));

const docRow = (ref, s, extra = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                                          included: true, rests_under: "load_bearing", ...extra });
const copyRow = (ref, original, copy, label = LABEL) => docRow(ref, original, { included: false, obscured: { copy, label } });
const capOf = (w, id) => w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, id).capture_sha;

function registerCopy(w, env, ref, bytes) {
  const s = hex(bytes);
  w.st.sql.exec(`INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
                 ON CONFLICT(sha256,bundle_id,path) DO NOTHING`, s, ref, `materials/${s}`, "obscured", bytes.length, NOW);
  env.PUBLISHED.m.set(`bio/published/${s}`, bytes);
}

/* The case edition over F resting on `materials`, signed and published, then assembled (the manifest only: the zip is read
   by the tests that need it, as one the zip refuses must not hide what is asserted without it). */
async function publish(w, env, materials, { copies = [], assemble = true } = {}) {
  if (w.p.caseCarriage && typeof w.p.caseCarriage.marksLapsed === "function") w.p.caseCarriage.marksLapsed = () => [];
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: [...new Set(materials.map((m) => m.ref))].map((target) => ({ target })) });
  const pin = w.head(F);
  w.prepare(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }], materials });
  const signed = w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 400));
  assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, enc(w.text(F)));
  for (const [ref, bytes] of copies) registerCopy(w, env, ref, bytes);
  if (!assemble) return { out: null, m: null };
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio",
                                            cs: w.p.caseEditionState(CASE, 1, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 400));
  const m = JSON.parse(new TextDecoder().decode(new Uint8Array(await (await call(w, env, "publishedbytes", { sha256: out.manifest_sha })).arrayBuffer())));
  return { out, m };
}
/* Two captures of one photo, both carried as their copies: two rows of one `ref`, each copy registered. */
async function twoCopies({ identical = false } = {}) {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(PHOTO);
  const A = capOf(w, PHOTO);
  const rows = identical ? [copyRow(PHOTO, A, CA), copyRow(PHOTO, ORIG_B, CA)]
                         : [copyRow(PHOTO, A, CA), copyRow(PHOTO, ORIG_B, CB)];
  const p = await publish(w, env, rows, { copies: identical ? [[PHOTO, COPY_A]] : [[PHOTO, COPY_A], [PHOTO, COPY_B]] });
  return { w, env, A, B: ORIG_B, ...p };
}
const status = async (w, env, sha) => (await call(w, env, "publishedbytes", { sha256: sha })).status;
const stamp = (w, seq, effect, parts) => w.stamps.stamp({ case: CASE, editions: [1], entry: { seq }, effect, parts });

/* ---- (A) the court order's join, by the copy's own hash */

test("R28 R23 G50 (A) two copied rows of one ref: an order sealing capture A's original withholds A's copy and not B's, and an order naming B's original withholds B's copy and not A's", async () => {
  const { w, env, A, B } = await twoCopies();
  assert.deepEqual([await status(w, env, CA), await status(w, env, CB)], [200, 200], "before any order both copies are served");
  stamp(w, 7, "seal", [A]);
  assert.deepEqual([await status(w, env, CA), await status(w, env, CB)], [451, 200], "seal [A]: A's copy withheld, B's served");
  stamp(w, 8, "unseal", [A]);
  assert.deepEqual([await status(w, env, CA), await status(w, env, CB)], [200, 200], "unseal [A] serves it again");
  stamp(w, 9, "seal", [B]);
  assert.deepEqual([await status(w, env, CA), await status(w, env, CB)], [200, 451], "seal [B]: B's copy withheld, A's served");
});

test("R28 G50 (A) an order on a copy's own hash withholds that copy only; the ref's plain path still withholds both copies", async () => {
  const { w, env } = await twoCopies();
  stamp(w, 7, "seal", [CA]);
  assert.deepEqual([await status(w, env, CA), await status(w, env, CB)], [451, 200], "seal on cA's own hash: cA only");
  stamp(w, 8, "unseal", [CA]);
  stamp(w, 9, "seal", [caseFilePath("document", PHOTO)]);
  assert.deepEqual([await status(w, env, CA), await status(w, env, CB)], [451, 451], "the ref's plain path names the material: both copies");
});

test("R28 G50 (A) two rows whose copies are the same bytes with two originals: an order naming either original withholds that copy", async () => {
  const { w, env, A, B } = await twoCopies({ identical: true });
  assert.equal(await status(w, env, CA), 200);
  stamp(w, 7, "seal", [A]);
  assert.equal(await status(w, env, CA), 451, "naming the first original");
  stamp(w, 8, "unseal", [A]);
  assert.equal(await status(w, env, CA), 200);
  stamp(w, 9, "seal", [B]);
  assert.equal(await status(w, env, CA), 451, "naming the second original");
});

test("R28 G50 (A) controls: one capture, the order on its original's hash withholds the copy, and an order on the other material's path withholds nothing of it", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(PHOTO); w.doc(DOC);
  const A = capOf(w, PHOTO), docSha = capOf(w, DOC);
  await publish(w, env, [docRow(DOC, docSha), copyRow(PHOTO, A, CA)], { copies: [[PHOTO, COPY_A]] });
  stamp(w, 7, "seal", [caseFilePath("document", DOC)]);
  assert.deepEqual([await status(w, env, CA), await status(w, env, docSha)], [200, 451], "the other material's path: only that material");
  stamp(w, 8, "unseal", [caseFilePath("document", DOC)]);
  stamp(w, 9, "seal", [A]);
  assert.deepEqual([await status(w, env, CA), await status(w, env, docSha)], [451, 200], "the original's hash: the copy only");
});

/* ---- the R-OLD goldens (`g50-old-goldens.json`, recorded at the G50 base by `make-g50-goldens.mjs`, never by this code) */

const GOLDEN = JSON.parse(readFileSync(new URL("./g50-old-goldens.json", import.meta.url), "utf8"));

test("R23 R28 G50 controls: the one-capture case of obscured.test.mjs is built again, with the code as it now stands, byte for byte as the golden: its manifest (bio-case-file/3), its parts' bytes, its complete edition, and the files an order on the included document withholds", async () => {
  const g = GOLDEN.one_capture, now = await buildScene("one_capture");
  assert.equal(now.manifest.format, "bio-case-file/3");
  assert.deepEqual(now.manifest, g.manifest);
  assert.equal(now.manifest_sha, g.manifest_sha);
  assert.deepEqual(now.parts.map((p) => [p.index, p.sha256, p.bytes_b64]), g.parts.map((p) => [p.index, p.sha256, p.bytes_b64]));
  assert.equal(now.complete_edition, g.complete_edition);
  assert.deepEqual(now.order_on, g.order_on);
  assert.deepEqual(now.withheld, g.withheld, "today's prefix rule and item joins, unchanged for one capture");
});

/* ---- (B) the case file's paths: a `ref` on two or more rows names each file by the row's capture (`bio-case-file/4`).
   Red by name until CASE-GRAMMAR #21 merges (the discriminated path, the format that declares it, the check and the
   complete edition's lookup are its). */

const V4 = "bio-case-file/4";
const dec = (b) => new TextDecoder().decode(b);
const bytesOf = async (r) => new Uint8Array(await r.arrayBuffer());
const rowsOf = (w) => materialsOf(parseFrontmatter(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=1`, CASE).text).data).materials;
const putBytes = (env, bytes) => { env.PUBLISHED.m.set(`bio/published/${hex(bytes)}`, bytes); return hex(bytes); };
async function zipOf(w, env, manifestSha, part = 1) {
  const r = await call(w, env, "publishedbytes", { sha256: manifestSha, format: "zip", part });
  assert.equal(r.status, 200, `the zip part ${part} is served`);
  const zip = await bytesOf(r), zc = readContainer(zip);
  assert.equal(zc.ok, true);
  return { zip, names: zc.entries.map((e) => e.name), read: async (name) => (await readPart(zip, zc, name)).bytes };
}
/* Each file of the case file, read out of the zip part that carries it, at the hash the manifest names. */
async function everyFileAtItsHash(w, env, out, m) {
  for (const pt of m.parts) {
    const z = await zipOf(w, env, out.manifest_sha, pt.index);
    for (const f of m.files.filter((x) => x.part === pt.index)) assert.equal(hex(await z.read(f.path)), f.sha256, f.path);
  }
}
const pathsOf = (m, kind) => m.files.filter((f) => f.kind === kind).map((f) => f.path).sort();

test("R23 G50 (B) two copied rows of one ref: the case file states bio-case-file/4 and carries each copy at its own capture's path; the check finds no departure; the zip is served and each entry hashes to its copy; each copy answers by its hash", async () => {
  const { w, env, A, B, out, m } = await twoCopies();
  assert.equal(m.format, V4);
  assert.deepEqual(pathsOf(m, "obscured"), [`materials/${PHOTO}/${A}/obscured`, `materials/${PHOTO}/${B}/obscured`].sort());
  assert.deepEqual(m.files.filter((f) => f.kind === "obscured").map((f) => [f.path.split("/")[2], f.sha256]).sort(),
                   [[A, CA], [B, CB]].sort(), "each copy under its own original's hash");
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), [], "case-grammar R13's one check, given the rows");
  await everyFileAtItsHash(w, env, out, m);
  for (const s of [CA, CB]) assert.equal(await status(w, env, s), 200, s);
});

test("R24 G50 (B) the complete edition of two copied rows of one ref is case-grammar.completeEditionOf over the case file's files, each copy named", async () => {
  const { w, env, out, m } = await twoCopies();
  const z = await zipOf(w, env, out.manifest_sha);
  const others = [];
  for (const f of m.files) if (f.kind !== "complete_edition") others.push({ path: f.path, kind: f.kind, sha256: f.sha256, bytes: f.bytes, content: await z.read(f.path) });
  const want = completeEditionOf({ format: m.format, group: m.group, case: m.case, edition: m.edition, case_document_sha: m.case_document_sha, keys: m.keys, files: others });
  const ce = m.files.find((f) => f.kind === "complete_edition");
  assert.equal(dec(await z.read(ce.path)), want);
  for (const s of [CA, CB]) assert.ok(want.includes(s), `the complete edition names the copy at ${s}`);
});

test("R23 G50 (B) publishedcase lists both capture paths in its file list and both rows' copies among its materials; its file list treats paths as opaque", async () => {
  const { w, A, B } = await twoCopies();
  const c = w.read("publishedcase", { id: CASE });
  assert.deepEqual(c.files.filter((f) => f.kind === "obscured").map((f) => f.path).sort(),
                   [`materials/${PHOTO}/${A}/obscured`, `materials/${PHOTO}/${B}/obscured`].sort());
  assert.deepEqual(c.materials.materials.filter((r) => r.obscured).map((r) => [r.sha, r.obscured.copy]).sort(), [[A, CA], [B, CB]].sort());
});

/* two included captures of one source (the address re-fetched after it changed, both kept): the T3 case */
const T3_B = "the second capture of the minutes, re-fetched after the page changed";
const T3_EX = { A: "extracted text of capture A", B: "extracted text of capture B" };
async function twoIncluded(kind = "document") {
  const w = world(), env = { PUBLISHED: bucket() };
  const ref = kind === "observation" ? w.observe("ann") : DOC;
  if (kind === "document") w.doc(DOC);
  else w.member("ann");
  const A = capOf(w, ref), bytesA = enc(`the text of ${ref}`);
  const B = putBytes(env, enc(T3_B));
  if (kind === "document") for (const t of [bytesA, enc(T3_EX.A), enc(T3_EX.B)]) putBytes(env, t);
  else putBytes(env, bytesA);
  const row = (s, ex) => ({ ref, kind, sha: s, text_sha: kind === "document" ? hex(enc(ex)) : null, origin: null, archived_copy: null,
                            included: true, rests_under: "load_bearing" });
  const p = await publish(w, env, [row(A, T3_EX.A), row(B, T3_EX.B)]);
  return { w, env, ref, A, B, ...p };
}

test("R23 G50 (B) T3: two included captures of one ref carry each capture's document and extracted text at its own path, bio-case-file/4, and the zip is served", async () => {
  const { w, env, ref, A, B, out, m } = await twoIncluded("document");
  assert.equal(m.format, V4);
  assert.deepEqual(pathsOf(m, "document"), [`materials/${ref}/${A}/document`, `materials/${ref}/${B}/document`].sort());
  assert.deepEqual(pathsOf(m, "extracted_text"), [`materials/${ref}/${A}/extracted.txt`, `materials/${ref}/${B}/extracted.txt`].sort());
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), []);
  const z = await zipOf(w, env, out.manifest_sha);
  assert.equal(dec(await z.read(`materials/${ref}/${B}/document`)), T3_B, "each capture's own bytes under its own path");
  assert.equal(dec(await z.read(`materials/${ref}/${B}/extracted.txt`)), T3_EX.B);
  assert.equal(dec(await z.read(`materials/${ref}/${A}/extracted.txt`)), T3_EX.A);
  await everyFileAtItsHash(w, env, out, m);
});

test("R23 G50 (B) T3: two included observation captures of one ref likewise, at materials/<ref>/<sha>/observation.md", async () => {
  const { w, env, ref, A, B, out, m } = await twoIncluded("observation");
  assert.equal(m.format, V4);
  assert.deepEqual(pathsOf(m, "observation"), [`materials/${ref}/${A}/observation.md`, `materials/${ref}/${B}/observation.md`].sort());
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), []);
  await everyFileAtItsHash(w, env, out, m);
});

test("R23 G50 (B) a ref with a copy beside an included document (the mixed ref, g1's facts) is built again as /4 with no original_carried; its copy and its document each at their own capture's path", async () => {
  const now = await buildScene("g1");
  assert.equal(now.manifest.format, V4);
  const rows = rowsOf(now.w);
  assert.deepEqual(caseFileManifestCheck(now.manifest, { materials: rows }), [], "no original_carried, no departure at all");
  const orig = GOLDEN.g1.rows[1].sha, second = GOLDEN.g1.rows[2].sha;
  assert.deepEqual(now.manifest.files.filter((f) => f.path.startsWith(`materials/${PHOTO}/`)).map((f) => f.path),
                   [`materials/${PHOTO}/${second}/document`, `materials/${PHOTO}/${orig}/obscured`].sort());
});

test("R23 G50 (B) a ref with an included and an excluded row (g2's facts) is built again as /4: the included row's document at its capture's path, and the check answers no departure", async () => {
  const now = await buildScene("g2");
  assert.equal(now.manifest.format, V4);
  assert.deepEqual(caseFileManifestCheck(now.manifest, { materials: rowsOf(now.w) }), []);
  assert.deepEqual(now.manifest.files.filter((f) => f.kind === "document").map((f) => f.path), [`materials/${DOC}/${GOLDEN.g2.rows[0].sha}/document`]);
});

test("R23 G50 (B) a ref on two rows with no file for either stays bio-case-file/3, its paths unchanged", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  const A = capOf(w, DOC);
  const { m } = await publish(w, env, [docRow(DOC, A, { included: false }), docRow(DOC, hex(enc("another capture")), { included: false })]);
  assert.equal(m.format, "bio-case-file/3");
  assert.equal(m.files.some((f) => f.path.startsWith("materials/")), false, "no material file at all");
});

test("R23 G50 (B) one capture per ref stays bio-case-file/3 and builds again byte for byte as the golden (the existing casefile, obscured and archives tests pass unchanged)", async () => {
  const now = await buildScene("one_capture");
  assert.equal(now.manifest.format, "bio-case-file/3");
  assert.deepEqual(now.manifest, GOLDEN.one_capture.manifest);
  assert.deepEqual(now.parts.map((p) => p.sha256), GOLDEN.one_capture.parts.map((p) => p.sha256), "part digests equal the golden's");
});

for (const name of ["one_capture", "g1", "g2"]) {
  test(`R23 R28 G50 controls: the stored ${name} case file (bio-case-file/3, recorded at the base) is served and read byte for byte as it was: its manifest, its parts, its complete edition, and the files an order on the included document withholds`, async () => {
    const g = GOLDEN[name], stored = await buildScene(name, g);
    assert.equal(stored.manifest.format, "bio-case-file/3");
    assert.deepEqual(stored.manifest, g.manifest);
    assert.deepEqual(stored.parts.map((p) => [p.index, p.sha256, p.bytes_b64]), g.parts.map((p) => [p.index, p.sha256, p.bytes_b64]), "every part's bytes");
    assert.equal(stored.complete_edition, g.complete_edition);
    assert.deepEqual(stored.withheld, g.withheld, "today's prefix rule: the same files withheld by the same order");
    assert.equal(w_status_ok(stored), true);
  });
}
const w_status_ok = (stored) => stored.manifest.files.every((f) => typeof f.sha256 === "string");

/* ---- (B) a court order over the new paths. The chains (a document's `container` records and archives) are put in the facts
   by hand, as `case-carriage` R8 would register them (`archives.test.mjs` drives the real registration for one capture); the
   case file is then built by the real `buildCaseFile` and recorded as the Worker records it. */

const OTHER = "INFO-2026-0002-annex";
const rec = (member, archive) => canonicalJson({ member_sha256: member, archive_sha256: archive, path: "x.txt", index: 0 });
async function chainScene({ unreadable = false, share = false } = {}) {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC); w.doc(OTHER);
  const A = capOf(w, DOC), O = capOf(w, OTHER);
  putBytes(env, enc(`the text of ${DOC}`)); putBytes(env, enc(`the text of ${OTHER}`));
  const B = putBytes(env, enc(T3_B));
  await publish(w, env, [docRow(DOC, A), docRow(DOC, B), docRow(OTHER, O)], { assemble: false });
  const texts = {}, X = hex(enc("archive X")), Y = hex(enc("archive Y")), Z = share ? X : hex(enc("archive Z")), W = hex(enc("archive W"));
  const link = (kind, text, member, of) => {
    const bytes = enc(text);
    if (unreadable) putBytes(env, bytes);
    texts[of] = (texts[of] || []);
    return { kind, sha: hex(bytes), text: unreadable ? null : text, member };
  };
  const chain = (member, pairs) => pairs.flatMap(([from, to, label]) => [link("container", rec(from, to), from, member), link("archive", label, from, member)]);
  const facts = await w.read("casefilefacts", { caseId: CASE, edition: 1 });
  const entry = (ref, sha) => facts.materials.find((m) => m.ref === ref && m.sha === sha);
  /* A rests in archive X, itself a member of archive Y; B in archive Z; the annex in archive W. An archive's text is its name. */
  entry(DOC, A).archives = [link("container", rec(A, X), A, A), { ...link("archive", "archive X", A, A), sha: X },
                            link("container", rec(X, Y), X, A), { ...link("archive", "archive Y", X, A), sha: Y }];
  entry(DOC, B).archives = [link("container", rec(B, Z), B, B), ...(share ? [{ ...link("archive", "archive X", B, B), sha: X }] : [{ ...link("archive", "archive Z", B, B), sha: Z }])];
  entry(OTHER, O).archives = [link("container", rec(O, W), O, O), { ...link("archive", "archive W", O, O), sha: W }];
  void chain;
  if (unreadable) for (const m of facts.materials) for (const a of m.archives) if (a.kind === "archive") putBytes(env, enc(a.sha === X ? "archive X" : a.sha === Y ? "archive Y" : a.sha === W ? "archive W" : "archive Z"));
  if (unreadable) for (const m of facts.materials) for (const a of m.archives) if (a.kind === "archive") a.text = null;
  const read = async (x) => { const o = await env.PUBLISHED.get(`bio/published/${x}`); return o ? new Uint8Array(await o.arrayBuffer()) : null; };
  const built = await buildCaseFile({ facts, group: "parks-group", read });
  assert.equal(built.ok, true, JSON.stringify(built).slice(0, 300));
  for (const f of built.files) env.PUBLISHED.m.set(`bio/published/${f.sha256}`, f.content);
  const { bytes, quartet } = await inbandQuartet({ subject: built.manifest, over: "a case file manifest", date: NOW, author: "olive", bar: null });
  assert.equal(w.p.recordCaseManifest({ caseId: CASE, edition: 1, manifest: built.manifest, manifestSha: quartet.hash.sha256, bytes: bytes.length }).ok, true);
  env.PUBLISHED.m.set(`bio/published/${quartet.hash.sha256}`, bytes);
  return { w, env, m: built.manifest, A, B, O, X, Y, Z, W, manifestSha: quartet.hash.sha256 };
}
const fileOf = (m, path) => m.files.find((f) => f.path === path);
/* which of `paths` an order in force withholds, by publishedbytes */
async function withheldOf(w, env, m, paths) {
  const out = [];
  for (const p of paths) if ((await call(w, env, "publishedbytes", { sha256: fileOf(m, p).sha256 })).status === 451) out.push(p);
  return out.sort();
}

for (const unreadable of [false, true]) {
  test(`R28 R32 G50 (B) an order on one capture's document path withholds that capture's document and its own container record, and every archive and outward link of the ref at the ref level, never a sibling capture's own record or another ref${unreadable ? "; with every record unreadable inline, the same files" : ""}`, async () => {
    const { w, env, m, A, B, O, X, Y, Z, W } = await chainScene({ unreadable });
    assert.equal(m.format, V4);
    const P = (kind, ref, key) => caseFilePath(kind, [ref, key]);
    const all = [P("document", DOC, A), P("document", DOC, B), caseFilePath("document", OTHER), P("container", DOC, A), P("container", DOC, B), P("container", DOC, X),
                 P("archive", DOC, X), P("archive", DOC, Y), P("archive", DOC, Z), P("container", OTHER, O), P("archive", OTHER, W)];
    for (const p of all) assert.ok(fileOf(m, p), `${p} is carried`);
    assert.deepEqual(await withheldOf(w, env, m, all), [], "nothing before an order");
    w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 7 }, effect: "seal", parts: [P("document", DOC, A)] });
    assert.deepEqual(await withheldOf(w, env, m, all),
      [P("document", DOC, A), P("container", DOC, A), P("container", DOC, X), P("archive", DOC, X), P("archive", DOC, Y), P("archive", DOC, Z)].sort(),
      "A's document, its own record, and the ref's archives and outward link; not B's document or B's own record, nor the annex's");
  });
}

test("R28 G50 (B) an order on the ref's plain document path withholds every capture's document and every record and archive of the ref, and not another ref's; an unseal serves them again", async () => {
  const { w, env, m, A, B, O, X, Y, Z, W } = await chainScene();
  const P = (kind, ref, key) => caseFilePath(kind, [ref, key]);
  const mine = [P("document", DOC, A), P("document", DOC, B), P("container", DOC, A), P("container", DOC, B), P("container", DOC, X),
                P("archive", DOC, X), P("archive", DOC, Y), P("archive", DOC, Z)];
  const others = [caseFilePath("document", OTHER), P("container", OTHER, O), P("archive", OTHER, W)];
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 7 }, effect: "seal", parts: [caseFilePath("document", DOC)] });
  assert.deepEqual(await withheldOf(w, env, m, [...mine, ...others]), mine.sort());
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 8 }, effect: "unseal", parts: [caseFilePath("document", DOC)] });
  assert.deepEqual(await withheldOf(w, env, m, [...mine, ...others]), []);
});

test("R28 R32 G50 (B) control: under a one-row ref the order withholds exactly its directory's archives and records, the prefix rule as it was", async () => {
  const { w, env, m, A, B, O, X, W } = await chainScene();
  const P = (kind, ref, key) => caseFilePath(kind, [ref, key]);
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 7 }, effect: "seal", parts: [caseFilePath("document", OTHER)] });
  const all = [P("document", DOC, A), P("document", DOC, B), P("container", DOC, A), P("archive", DOC, X), caseFilePath("document", OTHER), P("container", OTHER, O), P("archive", OTHER, W)];
  assert.deepEqual(await withheldOf(w, env, m, all), [caseFilePath("document", OTHER), P("container", OTHER, O), P("archive", OTHER, W)].sort());
  void B;
});

test("R23 G50 (B) an archive two captures of one ref share is listed once, its path and bytes the same; the case file's check finds no repeated path and the zip is served", async () => {
  const { w, env, m, X, manifestSha } = await chainScene({ share: true });
  assert.equal(m.files.filter((f) => f.path === caseFilePath("archive", [DOC, X])).length, 1, "the shared archive, once");
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), []);
  await zipOf(w, env, manifestSha);
});

/* ---- (B) a several-ref row whose sha is not 64 hex after lower-casing has no capture to spell: its files are named in unheld
   and never spelled plain, the case file is still built (`/4`, its sibling rows discriminated) and its check is as stated */

const BAD = "not-a-sha-but-a-row-the-team-signed";
async function withBadRow(kind, mk) {
  const w = world(), env = { PUBLISHED: bucket() };
  const ref = kind === "observation" ? w.observe("ann") : kind === "obscured" ? PHOTO : DOC;
  if (kind === "observation") w.member("ann"); else w.doc(ref);
  const A = capOf(w, ref), bytesA = enc(`the text of ${ref}`);
  putBytes(env, bytesA);
  const B = putBytes(env, enc(T3_B));
  const exA = putBytes(env, enc(T3_EX.A)), exB = putBytes(env, enc(T3_EX.B));
  const ex = putBytes(env, enc("extracted text of the row that has no sha"));
  const p = await publish(w, env, mk({ ref, A, B, exA, exB, ex }), { copies: kind === "obscured" ? [[ref, COPY_A]] : [] });
  return { w, env, ref, A, B, ...p };
}
const plainOf = (m, ref) => m.files.filter((f) => /^materials\/[^/]+\/[^/]+$/.test(f.path) && f.path.startsWith(`materials/${ref}/`));
const rowOf = (ref, kind, sha, extra = {}) => ({ ref, kind, sha, text_sha: null, origin: null, archived_copy: null, included: true, rests_under: "load_bearing", ...extra });

test("R23 G50 (B) a several-ref included document row whose sha is not a sha: its document and extracted text are unheld and never at a plain path; the siblings are discriminated; the case file is built as /4 and its check answers no departure", async () => {
  const { w, ref, A, B, m, out } = await withBadRow("document", ({ ref, A, B, exA, exB, ex }) =>
    [rowOf(ref, "document", A, { text_sha: exA }), rowOf(ref, "document", B, { text_sha: exB }), rowOf(ref, "document", BAD, { text_sha: ex })]);
  assert.equal(m.format, V4);
  assert.deepEqual(plainOf(m, ref), [], "no file at a plain path");
  assert.deepEqual(pathsOf(m, "document"), [`materials/${ref}/${A}/document`, `materials/${ref}/${B}/document`].sort());
  assert.deepEqual(out.unheld.filter((u) => u.sha === BAD || u.sha === hex(enc("extracted text of the row that has no sha"))).map((u) => [u.ref, u.what]).sort(),
                   [[ref, "bytes"], [ref, "extracted_text"]].sort());
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), []);
});

test("R23 G50 (B) a several-ref included observation row whose sha is not a sha: its observation is unheld and never at a plain path; the check answers no departure", async () => {
  const { w, ref, A, B, m, out } = await withBadRow("observation", ({ ref, A, B }) =>
    [rowOf(ref, "observation", A), rowOf(ref, "observation", B), rowOf(ref, "observation", BAD)]);
  assert.equal(m.format, V4);
  assert.deepEqual(plainOf(m, ref), []);
  assert.deepEqual(pathsOf(m, "observation"), [`materials/${ref}/${A}/observation.md`, `materials/${ref}/${B}/observation.md`].sort());
  assert.deepEqual(out.unheld.filter((u) => u.sha === BAD).map((u) => [u.ref, u.what]), [[ref, "text"]]);
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), []);
});

test("R23 G50 (B) a several-ref copied row whose original's sha is not a sha: its copy is unheld, never at a plain path, and the check answers exactly one obscured_copy_missing for that row and nothing else", async () => {
  const { w, ref, A, m, out } = await withBadRow("obscured", ({ ref, A }) =>
    [copyRow(ref, A, CA), copyRow(ref, BAD, CB)]);
  assert.equal(m.format, V4);
  assert.deepEqual(plainOf(m, ref), []);
  assert.deepEqual(pathsOf(m, "obscured"), [`materials/${ref}/${A}/obscured`]);
  assert.deepEqual(out.unheld.filter((u) => u.sha === CB).map((u) => [u.ref, u.what]), [[ref, "obscured"]]);
  const check = caseFileManifestCheck(m, { materials: rowsOf(w) });
  assert.deepEqual(check.map((d) => d.rule), ["obscured_copy_missing"], "exactly the one departure, for the row that states a copy no file carries");
  assert.ok(check[0].detail.includes(CB));
});

test("R23 G50 (B) a several-ref excluded row whose sha is not a sha carries no file either way; the check answers no departure, and no capture_unnamed or capture_missing", async () => {
  const { w, ref, A, B, m } = await withBadRow("document", ({ ref, A, B, exA, exB }) =>
    [rowOf(ref, "document", A, { text_sha: exA }), rowOf(ref, "document", B, { text_sha: exB }), rowOf(ref, "document", BAD, { included: false })]);
  assert.equal(m.format, V4);
  assert.deepEqual(pathsOf(m, "document"), [`materials/${ref}/${A}/document`, `materials/${ref}/${B}/document`].sort());
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), []);
});

/* ---- the 501 held captures of one source (R17's number, here held whole): one ref on 501 rows, 1,002 files */

test("R23 R5 G50 (B) k = 501: 501 held captures of one ref assemble, each document and extracted text at its own capture's path, the case file /4 with 1,002 material files, its check clean, and its zip part served", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  const rows = [];
  for (let i = 0; i < 501; i++) {
    const bytes = i === 0 ? enc(`the text of ${DOC}`) : enc(`capture ${i} of the minutes, kept after the page changed`);
    const text = enc(`extracted text of capture ${i}`);
    putBytes(env, bytes); putBytes(env, text);
    rows.push(rowOf(DOC, "document", hex(bytes), { text_sha: hex(text) }));
  }
  const { out, m } = await publish(w, env, rows);
  assert.equal(m.format, V4);
  assert.equal(m.files.filter((f) => f.kind === "document" || f.kind === "extracted_text").length, 1002);
  assert.equal(new Set(m.files.map((f) => f.path)).size, m.files.length, "no path twice");
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), []);
  assert.deepEqual(out.unheld, []);
  await everyFileAtItsHash(w, env, out, m);
});

test("R23 G50 (B) shas are compared lower-cased: a copied row whose original's sha is signed in upper case is spelled at the lower-case capture path, and the check finds no departure", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(PHOTO);
  const A = capOf(w, PHOTO);
  const { m } = await publish(w, env, [copyRow(PHOTO, A.toUpperCase(), CA), copyRow(PHOTO, ORIG_B, CB)], { copies: [[PHOTO, COPY_A], [PHOTO, COPY_B]] });
  assert.equal(m.format, V4);
  assert.deepEqual(pathsOf(m, "obscured"), [`materials/${PHOTO}/${A}/obscured`, `materials/${PHOTO}/${ORIG_B}/obscured`].sort());
  assert.deepEqual(caseFileManifestCheck(m, { materials: rowsOf(w) }), []);
});

test("R5 R23 G50 (B) bio-case-file/4 is a case file's format: the Worker recognises its manifest, and a format no case file states is not one", async () => {
  const { isCaseFileManifest } = await import("../../../src/public-read/casefile.mjs");
  const { m } = await twoCopies();
  assert.equal(m.format, V4);
  assert.equal(isCaseFileManifest(m), true);
  assert.equal(isCaseFileManifest({ ...m, format: "bio-case-file/5" }), false);
});

test("R23 G50 (B) casefilefacts states a several-ref entry's capture lower-cased and a ref on one row's entry no capture; the op is internal and declared by no door", async () => {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(PHOTO); w.doc(DOC);
  const A = capOf(w, PHOTO), docSha = capOf(w, DOC);
  await publish(w, env, [docRow(DOC, docSha), copyRow(PHOTO, A, CA), copyRow(PHOTO, ORIG_B, CB)], { copies: [[PHOTO, COPY_A], [PHOTO, COPY_B]], assemble: false });
  const facts = await w.read("casefilefacts", { caseId: CASE, edition: 1 });
  assert.equal(facts.ok, true);
  assert.equal(facts.materials.find((m) => m.ref === DOC).capture, undefined, "a ref on one row: no capture key");
  assert.deepEqual(facts.obscured.map((o) => [o.ref, o.capture]).sort(), [[PHOTO, A], [PHOTO, ORIG_B]].sort());
  assert.ok(facts.obscured.every((o) => !Object.hasOwn(o, "capture_invalid")));
  /* the refs the facts discriminate are the refs case-grammar counts on several rows (one definition of "several": its
     `refsOnSeveralRows`, which the checker is handed the rows to apply) */
  const named = new Set([...facts.materials, ...facts.obscured].filter((e) => Object.hasOwn(e, "capture")).map((e) => e.ref));
  assert.deepEqual([...named].sort(), [...G.refsOnSeveralRows(rowsOf(w))].sort());
});
