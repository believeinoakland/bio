/* public-read — the case file (R23, R24; R6's packaging and R5's part bound; DEC-112 (2), (3); K1315–K1318). A `/6` case
   edition is committed as ratification commits it (`publication` holding its included materials, its R57), its findings'
   bytes are in the published bucket, and the Worker's assembly (`assembleCaseContainer`) builds the case file from the
   published projection; it is then read back as a stranger reads it: the manifest checked by `case-grammar`'s one check,
   every file by its own hash, each part's ZIP through the plane's own reader, and the complete edition against
   `case-grammar`'s renderer. Each claim has its negative control: material not included and material this copy could not
   hold are not carried, a part the manifest does not list is refused, bytes the bucket holds at another hash are missing. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, caseDoc, V, NOW, KEY, sha } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { buildCaseFile, keyFingerprint, keyLine } from "../../../src/public-read/casefile.mjs";
import { CONTAINER_MAX_BYTES } from "../../../src/container.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";
import { canonicalJson, parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { CASE_FILE_FORMAT, CASE_FILE_MANIFEST_PATH, caseFileManifestCheck, casePartDigest, caseFilePath,
         completeEditionOf, gradingFactsLines, passagesLines, gradingFactsOf, passagesOf, extractedTextOf }
  from "../../../src/case-grammar/index.mjs";

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

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", G = "INQ-2026-0002-zoning";
const DOC = "INFO-2026-0001-minutes", ANNEX = "INFO-2026-0002-annex", GONE = "INFO-2026-0404-gone";
const UNITS = [{ seq: 0, extent: { kind: "document" }, ref: "¶1", text: "The minutes say so.", truncated: false }];

/* A /6 edition of CASE: F (load-bearing) rests on DOC and on G (a finding its chain reaches, not a member); OBS, an
   observation, is included; ANNEX is listed but not included; GONE is included and this copy never captured it. */
function publishedCase() {
  const w = world();
  w.member("olive"); w.member("ann");
  const proj = w.project("Parks", "olive");
  w.doc(DOC); w.doc(ANNEX);
  const capOf = (id) => w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, id).capture_sha;
  const docSha = capOf(DOC);
  w.units.set(docSha, { units: UNITS, state: "whole" });
  const obs = w.observe("ann");
  w.inquiry(G, { legs: [{ target: DOC }] });
  w.inquiry(F, { legs: [{ target: DOC }, { target: G }] });
  const pins = { [F]: w.head(F), [G]: w.head(G) };
  const materials = [
    { ref: DOC, kind: "document", sha: docSha, text_sha: sha(extractedTextOf(UNITS)), origin: "https://example.org/m",
      archived_copy: null, included: true, rests_under: "load_bearing" },
    { ref: obs, kind: "observation", sha: capOf(obs), text_sha: null, origin: null, archived_copy: null, included: true,
      rests_under: "load_bearing" },
    { ref: ANNEX, kind: "document", sha: capOf(ANNEX), text_sha: null, origin: null, archived_copy: null, included: false,
      rests_under: "supporting" },
    { ref: GONE, kind: "document", sha: sha("never captured"), text_sha: null, origin: null, archived_copy: null,
      included: true, rests_under: "supporting" }];
  const attestations = [
    { ref: DOC, by_kind: "group", by: "parks-group", level: null, at: NOW, signature: "case", recorded_in: null },
    { ref: DOC, by_kind: "project", by: proj, level: null, at: NOW, signature: null, recorded_in: DOC },
    { ref: DOC, by_kind: "co_attestation", by: "tsa.example", level: null, at: NOW, signature: null, recorded_in: null },
    { ref: ANNEX, by_kind: "group", by: "parks-group", level: null, at: NOW, signature: "case", recorded_in: null }];
  const leg = (finding, ord, target, kind, extra = {}) => ({ finding, ord, target, kind, role: "supports", grade: "B",
    grade_axis: "capture", grade_source: "recorded", ground: "a fetched copy", target_edition: null, answer: null,
    origins: [target], origins_complete: true, captures: kind === "document" ? [docSha] : [], author_key: null, ...extra });
  const grading = [leg(F, 0, DOC, "document"), leg(F, 1, G, "inquiry", { target_edition: 1 }), leg(G, 0, DOC, "document")];
  const passages = [{ finding: F, ord: 0, content_id: "c-1", capture_sha: docSha, extent: { kind: "document" },
                      chain: null, quoted: "The minutes say so." }];
  const text = caseDoc(CASE, 1, { project: proj, method: { grading: "bio-grading/1", checks: "1.57.0" }, materials,
    attestations, roles: [{ target: F, version_sha: pins[F], role: "load_bearing" }],
    strength: [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }] });
  const lines = text.split("\n");
  const close = lines.indexOf("---", 1);
  const doc = [...lines.slice(0, close), ...gradingFactsLines(grading), ...passagesLines(passages),
               ...lines.slice(close)].join("\n");
  assert.equal(w.p.storeCaseDocument({ case: CASE, edition: 1, text: doc, author: V("olive"), at: NOW }).ok, true);
  const signed = w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pins[F], role: "load_bearing" }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 400));
  assert.equal(w.signFinding(F).ok, true);
  assert.equal(w.signFinding(G).ok, true);
  const env = { PUBLISHED: bucket() };
  for (const id of [F, G]) env.PUBLISHED.m.set(`bio/published/${w.head(id)}`, new TextEncoder().encode(w.text(id)));
  return { w, env, proj, pins, docSha, obs, doc, grading, passages };
}
const stateOf = (w) => w.p.caseEditionState(CASE, 1, "parks-group");
const assemble = (w, env, extra = {}) =>
  assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs: stateOf(w), via: "test", ...extra });
async function manifestOf(w, env, out) {
  const r = await call(w, env, "publishedbytes", { sha256: out.manifest_sha });
  assert.equal(r.status, 200);
  return JSON.parse(dec(await bytesOf(r)));
}
async function partOf(w, env, out, part) {
  const r = await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", ...(part ? { part } : {}) });
  assert.equal(r.status, 200, `part ${part}`);
  const zip = await bytesOf(r);
  const zc = readContainer(zip);
  assert.equal(zc.ok, true);
  const read = async (name) => (await readPart(zip, zc, name)).bytes;
  return { zip, zc, names: zc.entries.map((e) => e.name), read };
}

test("R23 the case file carries, from the published projection only, the signed document and its signature, each finding a member's chain reaches with its bytes, signature, grading facts and passages, every included material whole with its extracted text, the attestations and the signing keys; its manifest passes case-grammar's check", async () => {
  const { w, env, docSha, obs, doc } = publishedCase();
  const out = await assemble(w, env);
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 400));
  const m = await manifestOf(w, env, out);
  assert.deepEqual(caseFileManifestCheck(m), [], "case-grammar R13's one check finds no departure");
  assert.deepEqual([m.format, m.group, m.case, m.edition], [CASE_FILE_FORMAT, "parks-group", CASE, 1]);
  assert.equal(m.case_document_sha, w.row(`SELECT doc_sha FROM case_documents WHERE case_id=?`, CASE).doc_sha);
  assert.deepEqual(m.files.map((f) => [f.path, f.kind]), [
    [`attestations/${DOC}/1-group.json`, "attestation"], [`attestations/${DOC}/2-project.json`, "attestation"],
    [`attestations/${DOC}/3-co_attestation.json`, "attestation"],
    ["case.md", "case_document"], ["case.md.sig", "case_signature"], ["complete-edition.html", "complete_edition"],
    [`findings/${F}/finding.md`, "finding"], [`findings/${F}/finding.md.sig`, "finding_signature"],
    [`findings/${F}/grading-facts.json`, "grading_facts"], [`findings/${F}/passages.json`, "passages"],
    [`findings/${G}/finding.md`, "finding"], [`findings/${G}/finding.md.sig`, "finding_signature"],
    [`findings/${G}/grading-facts.json`, "grading_facts"], [`findings/${G}/passages.json`, "passages"],
    [`materials/${DOC}/document`, "document"], [`materials/${DOC}/extracted.txt`, "extracted_text"],
    [`materials/${obs}/observation.md`, "observation"]],
    "G, reached through F's chain, is carried; ANNEX (not included) is not; GONE (never held) is not, and is named");
  assert.deepEqual(out.unheld.map((u) => [u.ref, u.what]), [[GONE, "bytes"], [GONE, "extracted_text"]]);
  assert.deepEqual(m.keys, [{ key: keyLine(KEY), fingerprint: await keyFingerprint(KEY) }],
                   "one signing key (the document's and both findings' signer), on one line, with its fingerprint");
  assert.ok(m.keys[0].key.endsWith(` ${KEY}`) || m.keys[0].key === KEY);
  assert.match(m.keys[0].fingerprint, /^SHA256:[A-Za-z0-9+/]{43}$/);
  /* the files, read out of the part, each at the hash the manifest names */
  const p = await partOf(w, env, out, 1);
  assert.deepEqual(p.names, [CASE_FILE_MANIFEST_PATH, ...m.files.map((f) => f.path)], "the manifest at the root, then each file at its path");
  assert.deepEqual(await p.read(CASE_FILE_MANIFEST_PATH), await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha })));
  const content = new Map();
  for (const f of m.files) {
    const b = await p.read(f.path);
    assert.equal(sha(Buffer.from(b)), f.sha256, f.path);
    assert.equal(b.length, f.bytes, f.path);
    content.set(f.path, b);
  }
  assert.equal(dec(content.get("case.md")), doc, "the signed document, whole");
  assert.equal(dec(content.get(`findings/${F}/finding.md`)), w.text(F));
  assert.equal(dec(content.get(`materials/${DOC}/document`)), `the text of ${DOC}`);
  assert.equal(dec(content.get(`materials/${DOC}/extracted.txt`)), extractedTextOf(UNITS));
  const fm = parseFrontmatter(doc).data;
  assert.equal(dec(content.get(`findings/${F}/grading-facts.json`)), canonicalJson(gradingFactsOf(fm)[F]));
  assert.equal(dec(content.get(`findings/${G}/grading-facts.json`)), canonicalJson(gradingFactsOf(fm)[G]));
  assert.deepEqual(JSON.parse(dec(content.get(`findings/${F}/passages.json`))), passagesOf(fm)[F], "each row with its chain (K1317)");
  assert.equal(JSON.parse(dec(content.get(`findings/${F}/passages.json`)))[0].chain, null);
  assert.deepEqual(JSON.parse(dec(content.get(`attestations/${DOC}/1-group.json`))).row.by_kind, "group");
  assert.equal(docSha, sha(`the text of ${DOC}`));
});

test("R24 the complete edition is case-grammar.completeEditionOf over the case file's other files, its SHA-256 in the manifest, served by hash like every published file", async () => {
  const { w, env } = publishedCase();
  const out = await assemble(w, env);
  const m = await manifestOf(w, env, out);
  const p = await partOf(w, env, out, 1);
  const others = [];
  for (const f of m.files) if (f.kind !== "complete_edition")
    others.push({ path: f.path, kind: f.kind, sha256: f.sha256, bytes: f.bytes, content: await p.read(f.path) });
  const want = completeEditionOf({ format: m.format, group: m.group, case: m.case, edition: m.edition,
                                   case_document_sha: m.case_document_sha, keys: m.keys, files: others });
  const ce = m.files.find((f) => f.kind === "complete_edition");
  assert.equal(dec(await p.read(ce.path)), want);
  assert.equal(ce.sha256, sha(want));
  assert.equal(out.complete_edition, ce.sha256);
  /* every file of the case file, the complete edition among them, answers by its own hash */
  for (const f of m.files) {
    const r = await call(w, env, "publishedbytes", { sha256: f.sha256 });
    assert.equal(r.status, 200, f.path);
    assert.equal(sha(Buffer.from(await bytesOf(r))), f.sha256, f.path);
    assert.equal(w.pr.verifySha(f.sha256).published, true, f.path);
  }
});

test("R6 each part is a stored ZIP with fixed timestamps, the same case file giving the same bytes; built once and recorded through publication's recordCaseManifest; an edition signed before T28 keeps its container", async () => {
  const { w, env } = publishedCase();
  const out = await assemble(w, env);
  const a = (await partOf(w, env, out, 1)).zip, b = (await partOf(w, env, out)).zip;
  assert.deepEqual(a, b, "part 1 by default, and the same bytes each time");
  const zc = readContainer(a);
  assert.ok(zc.entries.every((e) => e.method === 0), "stored, never deflated");
  const view = new DataView(a.buffer, a.byteOffset);
  assert.deepEqual([view.getUint16(10, true), view.getUint16(12, true)], [0, 0x0021], "the DOS epoch, never a clock");
  /* the same facts build the same case file */
  const facts = await w.read("casefilefacts", { caseId: CASE, edition: 1 });
  const read = async (s) => { const o = await env.PUBLISHED.get(`bio/published/${s}`); return o ? new Uint8Array(await o.arrayBuffer()) : null; };
  const x = await buildCaseFile({ facts, group: "parks-group", read }), y = await buildCaseFile({ facts, group: "parks-group", read });
  assert.deepEqual(x.manifest, y.manifest);
  assert.deepEqual(x.files.map((f) => f.content), y.files.map((f) => f.content));
  /* recorded once: assembling again records the same hash and nothing new; another manifest is refused */
  const again = await assemble(w, env);
  assert.equal(again.manifest_sha, out.manifest_sha);
  assert.equal(w.p.recordCaseManifest({ caseId: CASE, edition: 1, manifest: x.manifest, manifestSha: "e".repeat(64) }).reason,
               "MANIFEST_EXISTS");
  /* the edition's public read names the manifest */
  assert.equal(w.read("publishedcase", { id: CASE }).manifest_sha, out.manifest_sha);
  /* an edition signed before T28 (its document /5) completes into the container it was promised, unchanged */
  const L = "CASE-2026-0009", pin = w.head(F);
  w.prepare(L, 1, { format: "bio-case-document/5", project: stateOf(w).project, roles: [{ target: F, version_sha: pin }] });
  assert.equal(w.signCase(L, 1, { project: stateOf(w).project, roster: [{ bundle_id: F, version_sha: pin }] }).ok, true);
  const legacy = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs: w.p.caseEditionState(L, 1), via: "test" });
  const lm = JSON.parse(dec(await bytesOf(await call(w, env, "publishedbytes", { sha256: legacy.manifest_sha }))));
  assert.equal(lm.format, "bio-case-container/6");
  assert.equal(readContainer((await bytesOf(await call(w, env, "publishedbytes", { sha256: legacy.manifest_sha, format: "zip" })))).entries[0].name,
               "MANIFEST.json");
});

test("R5 R23 a case file past the part bound is split, never refused: each part fingerprinted by its files and listed in every part's manifest, every file in exactly one part; a part not listed is the required-argument refusal", async () => {
  const { w, env } = publishedCase();
  const BOUND = 2600;
  const out = await assemble(w, env, { maxBytes: BOUND });
  const m = await manifestOf(w, env, out);
  assert.deepEqual(caseFileManifestCheck(m), []);
  assert.ok(m.parts.length > 2, `split into ${m.parts.length} parts`);
  assert.equal(out.parts, m.parts.length);
  for (const pt of m.parts) assert.deepEqual({ sha256: pt.sha256, bytes: pt.bytes }, casePartDigest(m.files, pt.index));
  const seen = [];
  for (const pt of m.parts) {
    const p = await partOf(w, env, out, pt.index);
    assert.equal(dec(await p.read(CASE_FILE_MANIFEST_PATH)), dec(await bytesOf(await call(w, env, "publishedbytes", { sha256: out.manifest_sha }))),
                 "the same manifest at every part's root");
    const mine = m.files.filter((f) => f.part === pt.index).map((f) => f.path);
    assert.deepEqual(p.names.slice(1), mine, `part ${pt.index} carries exactly its files`);
    seen.push(...mine);
    const big = m.files.filter((f) => f.part === pt.index && f.bytes > BOUND);
    if (big.length) assert.equal(mine.length, 1, "a file over the bound sits alone in its part");
  }
  assert.deepEqual(seen, m.files.map((f) => f.path), "nothing is left out and nothing is carried twice");
  for (const part of [String(m.parts.length + 1), "0", "two"]) {
    const r = await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", part });
    assert.equal(r.status, 400, part);
    assert.equal((await r.json()).reason, "REQUIRED_ARGUMENT_MISSING", part);
  }
  assert.equal(CONTAINER_MAX_BYTES, 64 * 1024 * 1024, "the bound is 64 MiB for one part");
});

test("R5 a file the bucket holds at another hash is missing: the part is refused PART_MISSING (C-98.5), naming the file, and its other parts still serve", async () => {
  const { w, env } = publishedCase();
  const out = await assemble(w, env, { maxBytes: 2600 });
  const m = await manifestOf(w, env, out);
  const victim = m.files.find((f) => f.kind === "finding");
  env.PUBLISHED.m.set(`bio/published/${victim.sha256}`, new TextEncoder().encode("tampered"));
  const r = await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", part: victim.part });
  assert.equal(r.status, 409);
  const body = await r.json();
  assert.deepEqual([body.reason, body.check, body.path], ["PART_MISSING", "C-98.5", victim.path]);
  const other = m.parts.find((p) => p.index !== victim.part);
  assert.equal((await call(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", part: other.index })).status, 200);
});

test("R23 assembly states, and never builds, a case file that would leave out a finding's bytes it must carry", async () => {
  const { w, env } = publishedCase();
  env.PUBLISHED.m.delete(`bio/published/${w.head(G)}`);
  const out = await assemble(w, env);
  assert.deepEqual([out.ok, out.reason, out.finding], [false, "CASE_FILE_NOT_ASSEMBLED", G]);
  assert.equal(w.row(`SELECT manifest_sha FROM published_cases WHERE case_id=?`, CASE).manifest_sha, null, "nothing recorded");
  assert.equal(caseFilePath("finding", G), `findings/${G}/finding.md`);
});

test("R23 a co-attestation row carries each timestamp token publication held for its material (its R57, K1315), whole, by its own hash; a row whose material holds none carries none", async () => {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  const id = "INFO-2026-0003-stamped", body = `the text of ${id}`, token = "TSA-TOKEN-BYTES";
  const prov = { documents: [{ file: `snapshots/${id}.txt`, locator: `https://example.org/${id}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: sha(body), encoding: "utf8", bytes: Buffer.byteLength(body) },
    origin: { kind: "named_request" }, timestamp: { service: "tsa.example", token_file: "attestations/stamp.tsr" } }] };
  w.doc(DOC);
  const md = w.text(DOC).replace(new RegExp(DOC, "g"), id);
  assert.equal(w.promotion.promote({ bundleId: id, base: null, snapKey: "k-stamped", author: V("olive"),
    files: [{ path: "bundle.md", text: md }, { path: `snapshots/${id}.txt`, text: body },
            { path: "attestations/stamp.tsr", text: token }, { path: "data/provenance.json", text: JSON.stringify(prov) }],
    meta: { object_type: "information" },
    register: [{ sha256: sha(body), path: `snapshots/${id}.txt`, encoding: "utf8", bytes: Buffer.byteLength(body) }] }).ok, true);
  w.inquiry(F, { legs: [{ target: id }] });
  const pin = w.head(F);
  const row = (ref) => ({ ref, by_kind: "co_attestation", by: "tsa.example", level: null, at: NOW, signature: null, recorded_in: null });
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }],
    materials: [{ ref: id, kind: "document", sha: sha(body), text_sha: null, origin: null, archived_copy: null, included: true, rests_under: "load_bearing" },
                { ref: DOC, kind: "document", sha: sha(`the text of ${DOC}`), text_sha: null, origin: null, archived_copy: null, included: true, rests_under: "supporting" }],
    attestations: [row(id), row(DOC)] });
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  const out = await assemble(w, env);
  const m = await manifestOf(w, env, out);
  assert.deepEqual(caseFileManifestCheck(m), []);
  const p = await partOf(w, env, out, 1);
  const stamped = JSON.parse(dec(await p.read(`attestations/${id}/1-co_attestation.json`)));
  assert.deepEqual(stamped.row, { ...row(id) });
  assert.deepEqual(stamped.held, [{ sha256: sha(token), bytes_b64: Buffer.from(token).toString("base64") }]);
  assert.equal(dec(Buffer.from(stamped.held[0].bytes_b64, "base64")), token, "the token, whole");
  assert.deepEqual(JSON.parse(dec(await p.read(`attestations/${DOC}/1-co_attestation.json`))).held, [], "nothing held, nothing carried");
});
