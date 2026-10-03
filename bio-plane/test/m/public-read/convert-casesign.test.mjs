/* public-read — converts the public-read share of the old suite `bio-plane/test/casesign.test.mjs` (CASE-5b, the
   case-level signing ceremony): R6, the container carries the signed case document (its text, the ASCII signature
   statement and the armored signature) and the attestor key it names verifies with an external `ssh-keygen -Y verify`,
   over bytes read out of the container a stranger holds; R3, a published case serves the sha it froze after the member
   has moved on. The rest of that suite (the ceremony, the standing fence, the gate's C-41 family, the refusals at
   op=caseratify and op=ratify) belongs to other modules. The facts are rebuilt through the fixture's world: the case
   document is stored as case-authoring stores it and committed as ratification commits it (`commitCaseEdition`,
   `commitEdition`), with a REAL ed25519 signature over `caseRatifyStatement`. Driven at the module's interface: its
   methods, its ops, and the Worker's routes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { world, stubOf, bucket, V, NOW, sha, legacyCaseCommit } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { caseRatifyStatement, ratifyStatement, NS_RATIFY } from "../../../src/sshsig.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";

const HAVE_SSH_KEYGEN = !spawnSync("ssh-keygen", ["-Q"]).error;

class StoreSilent extends Error { constructor(op) { super(op); this.op = op; } }
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, StoreSilent, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const route = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};

const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
const QUESTION_1 = "Was the transfer authorised?";

/* A signer with a real ed25519 key: `sign(bytes)` is `ssh-keygen -Y sign -n bio-ratify` over exactly those bytes. */
function signer(dir, who) {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  const keyB64 = readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
  let n = 0;
  const sign = (bytes) => {
    const f = join(dir, `${who}-stmt-${++n}`);
    writeFileSync(f, bytes);
    execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", NS_RATIFY, f], { stdio: ["ignore", "ignore", "ignore"] });
    return readFileSync(`${f}.sig`, "utf8");
  };
  return { keyB64, sign };
}
/* The stranger's check: an external binary, the key the artifact names, the statement rebuilt from the artifact. */
function sshVerify(dir, statement, armored, keyB64, identity = "iris@bio") {
  const base = join(dir, `v-${Math.random().toString(36).slice(2)}`);
  writeFileSync(`${base}.sig`, armored);
  writeFileSync(`${base}.allowed`, `${identity} ssh-ed25519 ${keyB64}\n`);
  const r = spawnSync("ssh-keygen", ["-Y", "verify", "-f", `${base}.allowed`, "-I", identity, "-n", NS_RATIFY,
                                     "-s", `${base}.sig`], { input: statement });
  return r.status === 0;
}

/* One case over F pinned at its current version, its document signed by iris with a real key, F's own edition signed
   by her too, committed as ratification commits them; F's bytes in the published bucket under their sha. */
function signedCase(dir) {
  const w = world();
  w.member("iris");
  const proj = w.project("Parks", "iris");
  w.inquiry(F, { question: QUESTION_1 });
  const pin = w.head(F);
  const text = w.text(F);
  const prepared = w.prepare(CASE, 1, { format: "bio-case-document/5", project: proj, roles: [{ target: F, version_sha: pin }],
                                        strength: [{ target: F, axis: "capture", grade: "B" }], author: "iris" });
  const iris = signer(dir, "iris");
  const caseArmored = iris.sign(caseRatifyStatement(CASE, 1, prepared.doc_sha));
  /* A /5 edition, so one signed before T28 (publication R58): its rows as its commit wrote them then. */
  const committed = legacyCaseCommit(w, { case: CASE, edition: 1, project: proj,
    completeness: { statement: "It leaves out the minutes.", author: V("iris") },
    roster: [{ bundle_id: F, version_sha: pin }],
    sigArmored: caseArmored, attestorKey: iris.keyB64, attestorMember: "iris", deliveredBy: V("iris"), at: NOW });
  assert.equal(committed.ok, true, `commitCaseEdition: ${JSON.stringify(committed).slice(0, 300)}`);
  const findingArmored = iris.sign(ratifyStatement(F, pin));
  const edition = w.record.transact(() => w.p.commitEdition({ bundleId: F, bundleSha: pin, title: `Finding ${F}`,
    completeness: null, strength: null, memberCarriesBlocks: false, group: "test-group", edges: [],
    shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }],
    attestorKey: iris.keyB64, attestorMember: "iris", gateVersion: "plane-gate/test", sigArmored: findingArmored,
    deliveredBy: V("iris"), at: NOW }));
  assert.equal(edition.ok, true, `commitEdition: ${JSON.stringify(edition).slice(0, 300)}`);
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  return { w, env, pin, proj, text, docSha: prepared.doc_sha, iris, caseArmored, findingArmored };
}

test("R6 (casesign) the container carries the signed case document — its text, the ASCII statement and the armored signature — and the attestor key it names verifies with ssh-keygen -Y verify over bytes read out of the zip", { skip: !HAVE_SSH_KEYGEN && "ssh-keygen is not on PATH" }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "pr-casesign-"));
  try {
    const { w, env, pin, proj, text, docSha, iris, caseArmored, findingArmored } = signedCase(dir);
    const cs = w.p.caseEditionState(CASE, 1, "test-group");
    assert.equal(cs.complete, true);
    const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
    assert.match(String(out.manifest_sha), /^[0-9a-f]{64}$/, `assembled: ${JSON.stringify(out).slice(0, 300)}`);
    /* the public case read names the container it assembled */
    assert.equal(w.pr.publishedCase({ caseId: CASE }).manifest_sha, out.manifest_sha);

    /* WHAT A STRANGER HOLDS: the zip, by hash, through the public bytes route. Everything below is read out of it. */
    const zr = await route(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip" });
    assert.equal(zr.status, 200);
    const zip = new Uint8Array(await zr.arrayBuffer());
    const zc = await readContainer(zip);
    assert.equal(zc.ok, true);
    assert.deepEqual(zc.entries.map((e) => e.name), ["MANIFEST.json", `${CASE}/${F}/bundle.md`]);
    const mBytes = (await readPart(zip, zc, "MANIFEST.json")).bytes;
    assert.equal(sha(Buffer.from(mBytes)), out.manifest_sha, "the manifest in the zip re-hashes to its own name");
    const manifest = JSON.parse(new TextDecoder().decode(mBytes));
    assert.equal(new TextDecoder().decode((await readPart(zip, zc, `${CASE}/${F}/bundle.md`)).bytes), text);

    const cd = manifest.case_document;
    assert.equal(manifest.format, "bio-case-container/6");
    assert.deepEqual([manifest.case, manifest.edition], [CASE, 1]);
    /* the document's text, whole, re-hashing to the sha the signature covers */
    assert.equal(cd.doc_sha, docSha);
    assert.equal(sha(cd.text), docSha, "the text the stranger holds hashes to the signed sha");
    assert.equal(cd.text, w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=1`, CASE).text);
    /* the statement IN ASCII, written out here rather than taken from the builder, and the armored signature made */
    assert.equal(cd.signature.namespace, "bio-ratify");
    assert.equal(cd.signature.statement, `bio-ratify-case ${CASE} 1 ${docSha}\n`);
    assert.equal(cd.signature.armored, caseArmored);
    assert.ok(cd.signature.armored.startsWith("-----BEGIN SSH SIGNATURE-----"));
    assert.deepEqual(cd.attestor, { member: "iris", key_b64: iris.keyB64 });

    /* THE CASE'S OWN SIGNATURE VERIFIES, with the key the artifact names, over a statement rebuilt from the artifact */
    const rebuilt = `bio-ratify-case ${manifest.case} ${manifest.edition} ${cd.doc_sha}\n`;
    assert.equal(sshVerify(dir, rebuilt, cd.signature.armored, cd.attestor.key_b64), true);
    assert.equal(sshVerify(dir, cd.signature.statement, cd.signature.armored, cd.attestor.key_b64), true);
    /* and the verification is not vacuous: one flipped hex digit fails, as does another key */
    const flipped = cd.doc_sha.slice(0, 63) + (cd.doc_sha.endsWith("0") ? "1" : "0");
    assert.notEqual(flipped, cd.doc_sha);
    assert.equal(sshVerify(dir, `bio-ratify-case ${manifest.case} ${manifest.edition} ${flipped}\n`,
                           cd.signature.armored, cd.attestor.key_b64), false);
    assert.equal(sshVerify(dir, `bio-ratify-case ${manifest.case} 2 ${cd.doc_sha}\n`,
                           cd.signature.armored, cd.attestor.key_b64), false);
    const other = signer(dir, "omar");
    assert.equal(sshVerify(dir, rebuilt, cd.signature.armored, other.keyB64), false);

    /* each member's own signature, on its own bytes, verifies too */
    assert.equal(manifest.findings.length, 1);
    const f = manifest.findings[0];
    assert.deepEqual([f.bundle_id, f.bundle_sha, f.version_sha], [F, pin, pin]);
    assert.equal(f.signature.statement, `bio-ratify ${F} ${pin}\n`);
    assert.equal(f.signature.armored, findingArmored);
    assert.equal(sshVerify(dir, `bio-ratify ${f.bundle_id} ${f.bundle_sha}\n`, f.signature.armored, f.attestor.key_b64), true);
    assert.equal(sha(Buffer.from(text)), f.bundle_sha, "the member's part in the zip hashes to the sha it signed");

    /* every case fact the stranger needs is inside the bytes just verified, not a field asserted beside them */
    for (const s of [`case_id: ${CASE}`, "case_edition: 1", `case_project: ${proj}`, `target: ${F}`,
                     `version_sha: ${pin}`, "## Scope", "The question."])
      assert.ok(cd.text.includes(s), `the signed text carries ${s}`);
    assert.equal("strength" in manifest, false, "no case-level strength in the artifact that travels");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("R3 (casesign) the case is UNMOVED when its member moves on: every public read serves the sha it FROZE, never the version the finding now holds", { skip: !HAVE_SSH_KEYGEN && "ssh-keygen is not on PATH" }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "pr-casesign-"));
  try {
    const { w, env, pin, text } = signedCase(dir);
    const before = w.pr.publishedCase({ caseId: CASE });
    assert.equal(before.ok, true);
    assert.deepEqual([before.findings[0].bundle_sha, before.complete], [pin, true]);

    /* the member's working bytes move after publication */
    const moved = w.inquiry(F, { question: "Was the transfer authorised, re-read after the budget cycle?" });
    assert.equal(moved.ok, true);
    const movedSha = w.head(F);
    assert.notEqual(movedSha, pin, "(fixture) the member really moved: its current version is not the pinned one");

    /* by case id, by finding id, by the frozen hash — through the method and through the op */
    const answers = [w.pr.publishedCase({ caseId: CASE }), w.pr.publishedCase({ id: CASE }), w.pr.publishedCase({ id: F }),
                     w.pr.publishedCase({ sha256: pin }), w.read("publishedcase", { id: CASE }),
                     w.read("publishedcase", { sha256: pin.toUpperCase() })];
    for (const c of answers) {
      assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
      assert.deepEqual([c.caseId, c.edition, c.complete, c.awaiting], [CASE, 1, true, []]);
      assert.equal(c.findings.length, 1);
      const s = c.findings[0];
      assert.deepEqual([s.bundle_id, s.bundle_sha, s.version_sha], [F, pin, pin], "the frozen sha, never the moved one");
      assert.notEqual(s.bundle_sha, movedSha);
      assert.deepEqual(c.document.doc_sha, before.document.doc_sha, "the signed case document is unmoved too");
    }
    /* the moved version is working material: it resolves to nothing published, exactly as a hash that never existed */
    const never = w.pr.publishedCase({ sha256: "0".repeat(64) });
    assert.equal(never.reason, "NOT_PUBLISHED");
    assert.deepEqual(w.pr.publishedCase({ sha256: movedSha }), never);
    assert.deepEqual(w.pr.verifySha(movedSha).published, false);

    /* and the Worker's public case read renders the finding from the FROZEN bytes, not the working record */
    const r = await route(w, env, "publishedcase", { id: CASE });
    assert.equal(r.status, 200);
    const c = await r.json();
    assert.deepEqual([c.findings[0].bundle_sha, c.findings[0].body.state, c.findings[0].body.from_sha],
                     [pin, "published", pin]);
    assert.ok(c.findings[0].body.question.includes(QUESTION_1));
    assert.ok(!c.findings[0].body.question.includes("re-read after the budget cycle"), "never the moved question");
    assert.equal(c.findings[0].bytes, `op=publishedbytes&sha256=${pin}`);
    const b = await route(w, env, "publishedbytes", { sha256: pin });
    assert.equal(await b.text(), text, "the frozen bytes are still what the hash hands over");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
