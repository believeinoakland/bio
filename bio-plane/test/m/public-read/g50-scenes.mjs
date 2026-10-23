/* public-read — G50's three scenes (fix round 6), built the way `make-g50-goldens.mjs` built them at the G50 base, so the
   tests can build them again with the code as it now stands and compare with `g50-old-goldens.json`: the one-capture case of
   `obscured.test.mjs`, g1 (a `ref` with a copy beside an included document) and g2 (a `ref` with an included and an excluded
   row). `buildScene(name)` answers the world, the manifest and its parts, the complete edition, and the files a court order
   sealing the included document's path withholds. Not a test. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, stubOf, bucket, NOW } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { caseFilePath } from "../../../src/case-grammar/index.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";

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
const bytesOf = async (r) => new Uint8Array(await r.arrayBuffer());
const dec = (b) => new TextDecoder().decode(b);
const enc = (s) => new TextEncoder().encode(s);
const hex = (b) => createHash("sha256").update(b).digest("hex");

const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
const PHOTO = "INFO-2026-0020-photo", DOC = "INFO-2026-0001-minutes";
const LABEL = "Faces and plates obscured for publication; the team holds the original";
const COPY = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...enc("the photo, its marked areas covered"), 0xff, 0xd9]);
const COPY_SHA = hex(COPY);
const SECOND = enc("a second capture of the same source, held whole");
const SECOND_SHA = hex(SECOND);
const OTHER_SHA = hex(enc("a capture the team lists and does not include"));

const docRow = (ref, s, extra = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                                          included: true, rests_under: "load_bearing", ...extra });
const copyRow = (ref, original, copy = COPY_SHA) => docRow(ref, original, { included: false, obscured: { copy, label: LABEL } });
const capOf = (w, id) => w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, id).capture_sha;

function registerCopy(w, env, ref, bytes = COPY) {
  const s = hex(bytes);
  w.st.sql.exec(`INSERT INTO published_shas (sha256,bundle_id,path,kind,bytes,published) VALUES (?,?,?,?,?,?)
                 ON CONFLICT(sha256,bundle_id,path) DO NOTHING`, s, ref, `materials/${s}`, "obscured", bytes.length, NOW);
  env.PUBLISHED.m.set(`bio/published/${s}`, bytes);
}

/* The one thing the fixture draws at random is the project's four-digit id; the goldens recorded the id each scene drew
   (`projectDraw`), so the case document, and every hash under it, is built again byte for byte. */
function withDraw(draw, run) {
  const real = Object.getOwnPropertyDescriptor(globalThis.crypto, "getRandomValues");
  const fake = (a) => { if (a instanceof Uint16Array && a.length === 1) { a[0] = draw; return a; } return globalThis.crypto.constructor.prototype.getRandomValues.call(globalThis.crypto, a); };
  Object.defineProperty(globalThis.crypto, "getRandomValues", { value: fake, configurable: true, writable: true });
  try { return run(); } finally { if (real) Object.defineProperty(globalThis.crypto, "getRandomValues", real); else delete globalThis.crypto.getRandomValues; }
}

export async function build(name, materials, { extraBytes = [], copies = [], projectDraw = null, stored = null } = {}) {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC); w.doc(PHOTO);
  const original = capOf(w, PHOTO), docSha = capOf(w, DOC);
  const rows = materials({ original, docSha });
  if (w.p.caseCarriage && typeof w.p.caseCarriage.marksLapsed === "function") w.p.caseCarriage.marksLapsed = () => [];
  w.member("olive");
  const proj = projectDraw == null ? w.project("Parks", "olive") : withDraw(projectDraw, () => w.project("Parks", "olive"));
  w.inquiry(F, { legs: [...new Set(rows.map((m) => m.ref))].map((t) => ({ target: t })) });
  const pin = w.head(F);
  w.prepare(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }], materials: rows });
  const signed = w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 400));
  assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, enc(w.text(F)));
  for (const b of extraBytes) env.PUBLISHED.m.set(`bio/published/${hex(b)}`, b);
  for (const ref of copies) registerCopy(w, env, ref);
  let out;
  if (stored) {
    /* the case file as it was stored at the G50 base: its files in the published bucket, its manifest recorded as it was */
    const mb = enc(JSON.stringify(stored.manifest, null, 1));
    assert.equal(hex(mb), stored.manifest_sha);
    for (const p of stored.parts) {
      const zip = Buffer.from(p.bytes_b64, "base64"), zc = readContainer(zip);
      for (const e of zc.entries) if (e.name !== "manifest.json") { const b = (await readPart(zip, zc, e.name)).bytes; env.PUBLISHED.m.set(`bio/published/${hex(b)}`, b); }
    }
    env.PUBLISHED.m.set(`bio/published/${stored.manifest_sha}`, mb);
    const r = w.p.recordCaseManifest({ caseId: CASE, edition: 1, manifest: stored.manifest, manifestSha: stored.manifest_sha, bytes: mb.length });
    assert.equal(r.ok, true, JSON.stringify(r));
    out = { manifest_sha: stored.manifest_sha };
  } else {
    out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio",
                                        cs: w.p.caseEditionState(CASE, 1, "parks-group"), via: "test" });
  }
  assert.equal(typeof out.manifest_sha, "string", `${name}: ${JSON.stringify(out).slice(0, 400)}`);
  const manifest = JSON.parse(dec(await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha }))));
  const parts = [];
  for (const p of manifest.parts) {
    const zip = await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", part: p.index }));
    parts.push({ index: p.index, sha256: hex(zip), bytes_b64: Buffer.from(zip).toString("base64") });
  }
  const ce = manifest.files.find((f) => f.kind === "complete_edition");
  const complete_edition = dec(await bytesOf(await call(w, env, "publishedbytes", { sha256: ce.sha256 })));
  /* a court order sealing the included document's path: the files `publishedcase` then marks withheld */
  const sealed = [...new Set(rows.filter((m) => m.included === true && m.obscured == null).map((m) => caseFilePath("document", m.ref)))];
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 7 }, effect: "seal", parts: sealed });
  const withheld = w.read("publishedcase", { id: CASE }).files.filter((f) => f.withheld).map((f) => f.path).sort();
  return { w, env, rows: rows.map((m) => ({ ref: m.ref, sha: m.sha, included: m.included, obscured: m.obscured ?? null })),
           manifest_sha: out.manifest_sha, manifest, parts, complete_edition, order_on: sealed, withheld };
}


export const SCENES = {
  one_capture: (o) => build("one", ({ original, docSha }) => [docRow(DOC, docSha), copyRow(PHOTO, original)], { copies: [PHOTO], projectDraw: 9558, ...o }),
  g1: (o) => build("g1", ({ original, docSha }) => [docRow(DOC, docSha), copyRow(PHOTO, original), docRow(PHOTO, SECOND_SHA)],
                   { extraBytes: [SECOND], copies: [PHOTO], projectDraw: 5091, ...o }),
  g2: (o) => build("g2", ({ docSha }) => [docRow(DOC, docSha), docRow(DOC, OTHER_SHA, { included: false, rests_under: "supporting" })], { projectDraw: 5673, ...o }),
};
/** The scene built again with the code as it now stands; with `stored` (the golden of the same scene), instead its case
 *  file as stored at the G50 base is recorded and served. */
export const buildScene = (name, stored = null) => SCENES[name]({ stored });
