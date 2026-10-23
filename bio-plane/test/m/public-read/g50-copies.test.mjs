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
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { caseFilePath } from "../../../src/case-grammar/index.mjs";
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
async function publish(w, env, materials, { copies = [] } = {}) {
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
