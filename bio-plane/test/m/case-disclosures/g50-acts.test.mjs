/* case-disclosures, G50 (T51 fix round 6; R-SEAM, K4427): the seam from the member's own acts. A source captured twice, both
   captures held, is reached by ONE leg without `content_id` (`materialsOfLeg`), so `materialsJudged` answers two materials of
   one `ref` and `materialRows` two rows of that `ref` (R6, R7). The captures are made by the fixture's real acts (the
   register, the real `case-carriage` marking each photo, whose copy it holds), the rows are the ones `materialRows` writes
   into the case document, `case-carriage`'s real `holdMaterials` holds what those rows carry, and publication's real
   `assembleCaseContainer` builds the case file over the published projection those rows and held files make. Nothing here is
   a hand-written answer shape. Two files at one path are refused by the case file's own check (`path_twice`) and by the zip
   (`DUPLICATE_PATH`, 409); the assertions state what the member must get instead: a case file whose check finds no
   departure and a zip that is served. Red until the providers (case-grammar, public-read, case-checker, case-import) merge. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, V } from "./fixture.mjs";
import { world as pubWorld, stubOf, bucket, V as PV, NOW } from "../public-read/fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { caseFileManifestCheck, materialsOf, materialBlockLines, CASE_DOCUMENT_FORMAT } from "../../../src/case-grammar/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  // fixtures-contract: answer-envelope door-helpers
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

const AT = "2026-09-28T01:00:00Z";
const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
const Q = "INQ-2026-0001-q", SRC = "INFO-2026-0001-a";
const hex = (b) => createHash("sha256").update(b).digest("hex");

/* The member's acts: two held captures of SRC (photos the member marks, or documents), one question citing SRC by a leg over each,
   judged (R6), its rows written (R7), and what case-carriage holds for them (its R1). */
async function acts(photos) {
  const w = world({ realCarriage: true });
  w.member("alice");
  const shas = w.captures(SRC, 2, { ext: photos ? "png" : "txt" });
  if (photos)
    for (const s of shas) {
      const m = await w.carriage.obscureMark({ captureSha: s, areas: [{ rect: [0, 0, 4, 4], kind: "person" }], by: V("alice") });
      assert.equal(m.ok, true, JSON.stringify(m));
    }
  if (!photos)
    shas.forEach((s, i) => w.prov.recordReceipt({ address: `https://example.org/g50-${i}`, addressNorm: `example.org/g50-${i}`,
                                                  captureSha: s, retrieved: AT, via: "direct" }));
  /* One leg over each capture's passage (G47's route). A single leg naming no `content_id` is not enough: the plane mints
     it a content row over the one capture content resolves (`inquiry/index.mjs:870-880`), so it reaches that capture alone. */
  const legs = shas.map((s, i) => { const id = hex(`g50 passage ${i}`); w.content(id, s, SRC); return { target: SRC, content_id: id }; });
  w.finding(Q, legs);
  const reached = w.cd.materialsJudged(w.prepared([Q]), w.roles([Q], []), V("alice"));
  assert.deepEqual(reached.refusals, []);
  const out = w.cd.disclosureBlocks({ reached, withheld: w.cd.withheldOf([]), attributionOf: new Map(), project: "PROJ-x", author: "alice", at: AT });
  const lines = materialBlockLines({ materials: out.materials.rows, attestations: out.materials.attestations });
  const fm = w.fm(["---", `format: ${CASE_DOCUMENT_FORMAT}`, ...lines, "---", ""].join("\n"));
  const held = w.carriage.holdMaterials(fm, { caseId: CASE, edition: 1, at: AT });
  return { w, shas, reached, rows: out.materials.rows, held };
}

/* publication: the case edition resting on those rows, signed; the files case-carriage held registered by hash and their
   bytes put where ratification R39 puts them (as public-read's own tests stand in for both); then the real assembly. */
async function assembled({ w, rows, held }) {
  const p = pubWorld(), env = { PUBLISHED: bucket() };
  /* the commit's re-read of marks and copies (publication R57) is over THIS world's register, which holds none of the acts' captures: answered none, as public-read's own tests answer it */
  if (p.p.caseCarriage && typeof p.p.caseCarriage.marksLapsed === "function") p.p.caseCarriage.marksLapsed = () => [];
  p.member("olive");
  p.doc(SRC);
  const proj = p.project("Parks", "olive");
  p.inquiry(F, { legs: [{ target: SRC }] });
  const pin = p.head(F);
  p.prepare(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }], materials: rows });
  const signed = p.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 400));
  assert.equal(p.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(p.text(F)));
  const bytesOf = new Map();
  for (const r of w.rows(`SELECT sha256, text FROM published_material_texts`)) {
    p.st.sql.exec(`INSERT OR IGNORE INTO published_material_texts (sha256,kind,text,bytes,published) SELECT sha256,kind,text,bytes,published
                   FROM (SELECT ? AS sha256, 'document' AS kind, ? AS text, ? AS bytes, ? AS published)`, r.sha256, r.text, Buffer.byteLength(r.text), NOW);
    bytesOf.set(r.sha256, new TextEncoder().encode(r.text));
  }
  for (const [k, v] of w.bucket) { const b = Uint8Array.from(v); bytesOf.set(hex(b), b); void k; }
  for (const f of held.files) {
    const b = bytesOf.get(f.sha256);
    assert.ok(b, `case-carriage holds ${f.kind} ${f.sha256}`);
    p.st.sql.exec(`INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
                   ON CONFLICT(sha256,bundle_id,path) DO NOTHING`, f.sha256, f.ref, f.path, f.kind, b.length, NOW);
    env.PUBLISHED.m.set(`bio/published/${f.sha256}`, b);
  }
  const out = await assembleCaseContainer({ env, stub: stubOf(p), storeName: "bio", cs: p.p.caseEditionState(CASE, 1, "parks-group"), via: "test" });
  const call = async (q) => { const url = new URL("https://plane/?op=publishedbytes");
    for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
    return publishedRoutes({ op: "publishedbytes", url, env, stub: stubOf(p) }); };
  const fmRows = materialsOf(parseFrontmatter(p.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, CASE, 1).text).data).materials;
  return { out, call, fmRows };
}

for (const photos of [true, false]) {
  test(`R6, R7 (G50, R-SEAM): two ${photos ? "photos with copies" : "included documents"} of one bundle, both held, reached by a leg over each capture: two rows of one ref, two files held, and the case file assembles as /4 with no path twice and a served zip`, async () => {
    const a = await acts(photos);
    /* R6: two materials of one ref, one capture each */
    assert.deepEqual(a.reached.materials.map((m) => [m.ref, m.sha, m.included]), a.shas.map((s) => [SRC, s, !photos]));
    /* R7: two rows of one ref, each its own capture's */
    assert.deepEqual(a.rows.map((r) => [r.ref, r.sha]), a.shas.map((s) => [SRC, s]));
    if (photos) assert.equal(new Set(a.rows.map((r) => r.obscured.copy)).size, 2, "each photo has its own copy");
    /* case-carriage's real holdMaterials: both held, none refused */
    const kinds = a.held.files.filter((f) => f.ref === SRC && (photos ? f.kind === "obscured" : f.kind === "document"));
    assert.equal(kinds.length, 2, JSON.stringify({ files: a.held.files, unheld: a.held.unheld }).slice(0, 600));
    assert.equal(new Set(kinds.map((f) => f.sha256)).size, 2);
    /* publication's real assembly */
    const { out, call, fmRows } = await assembled(a);
    assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 600));
    const m = JSON.parse(new TextDecoder().decode(new Uint8Array(await (await call({ sha256: out.manifest_sha })).arrayBuffer())));
    assert.match(m.format, /^bio-case-file\/4$/);
    assert.deepEqual(caseFileManifestCheck(m, { materials: fmRows }), []);
    const paths = m.files.map((f) => f.path);
    assert.equal(new Set(paths).size, paths.length, "no path twice");
    const zip = await call({ sha256: out.manifest_sha, format: "zip", part: 1 });
    assert.equal(zip.status, 200);
    assert.deepEqual([...new Uint8Array(await zip.arrayBuffer()).slice(0, 2)], [0x50, 0x4b], "a zip");
  });
}
