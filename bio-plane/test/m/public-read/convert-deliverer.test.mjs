/* public-read — converts the public-read share of the old suite `bio-plane/test/deliverer.test.mjs` (REC-128: the
   record states who AUTHORISED and who DELIVERED): R2 and R3, `delivered_by` on `publishedList`, `publishedEditions`,
   `publishedCase`'s findings and case document, and the case's served manifest — the founder, a member, and
   UNDETERMINED where nothing was recorded, never read off the signer; R6, the container's `delivered_by` beside every
   `attestor` and its `verify` sentence. The rest of that suite (who the acts take the deliverer from, the standing to
   read or deliver an unsigned case, op=casedocument) belongs to other modules. The old suite drove miniflare; here the
   same facts are rebuilt through the fixture's world, committed as ratification commits them (`commitCaseEdition`,
   `commitEdition`) with the deliverer it would have taken from the session — and, for the legacy rows, with none, as a
   plane before REC-128 committed them. In every row iris SIGNS and somebody else (or nobody recorded) DELIVERS, so a
   `delivered_by` copied from the signer cannot pass. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, V, NOW, KEY, SIG, legacyCaseCommit } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";

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

const FOUNDER_IS = { kind: "founder", member: null };
const MEMBER_IS = (m) => ({ kind: "member", member: m });
const UNDETERMINED = /not inferred from the signer/;
const isUndetermined = (d) => !!d && d.kind === "undetermined" && d.member === null
  && typeof d.detail === "string" && UNDETERMINED.test(d.detail);
const kindOf = (d) => (d && typeof d === "object") ? (d.kind === "member" ? `member:${d.member}` : d.kind) : `ABSENT(${JSON.stringify(d)})`;

const CASE = "CASE-2026-0001", LEGACY_CASE = "CASE-2026-0002";
const LEAD = "INQ-2026-0001", OLD_LEAD = "INQ-2026-0002";
const LOOSE = "INFO-2026-0001", OLD_LOOSE = "INFO-2026-0002";

/* One case edition's commit, as ratification makes it; `deliveredBy` omitted is a legacy commit (no deliverer). */
function commitCase(w, caseId, project, roster, deliveredBy) {
  /* A /5 edition, so one signed before T28 (publication R58): its rows as its commit wrote them then. */
  const r = legacyCaseCommit(w, { case: caseId, edition: 1, project,
    completeness: { statement: "It leaves out the minutes.", author: V("iris") },
    roster, sigArmored: SIG(1), attestorKey: KEY, attestorMember: "iris", deliveredBy, at: NOW });
  assert.equal(r.ok, true, `commitCaseEdition ${caseId}: ${JSON.stringify(r).slice(0, 300)}`);
  return r;
}
function commitFinding(w, bundleId, deliveredBy) {
  const bundleSha = w.head(bundleId);
  const r = w.record.transact(() => w.p.commitEdition({ bundleId, bundleSha, title: `Finding ${bundleId}`,
    completeness: null, strength: null, memberCarriesBlocks: false, group: "test-group", edges: [],
    shas: [{ sha256: bundleSha, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(w.text(bundleId)) }],
    attestorKey: KEY, attestorMember: "iris", gateVersion: "plane-gate/test", sigArmored: SIG(9),
    ...(deliveredBy !== undefined ? { deliveredBy } : {}), at: NOW }));
  assert.equal(r.ok, true, `commitEdition ${bundleId}: ${JSON.stringify(r).slice(0, 300)}`);
  return r;
}

/* The record the old suite built: iris signs everything.
   - CASE: its document delivered by the FOUNDER; its finding LEAD delivered by GUS.
   - LOOSE: a ratified bundle in no case, delivered by the FOUNDER.
   - LEGACY_CASE, its finding OLD_LEAD and a loose OLD_LOOSE: committed with NO deliverer, as before REC-128. */
function record() {
  const w = world();
  for (const m of ["iris", "gus"]) w.member(m);
  const proj = w.project("Parks", "iris");
  const env = { PUBLISHED: bucket() };
  const put = (id) => env.PUBLISHED.m.set(`bio/published/${w.head(id)}`, new TextEncoder().encode(w.text(id)));
  for (const [caseId, lead, deliveredCase, deliveredFinding] of [[CASE, LEAD, "founder", V("gus")],
                                                                 [LEGACY_CASE, OLD_LEAD, undefined, undefined]]) {
    w.inquiry(lead);
    const pin = w.head(lead);
    w.prepare(caseId, 1, { format: "bio-case-document/5", project: proj, roles: [{ target: lead, version_sha: pin }],
                           strength: [{ target: lead, axis: "capture", grade: "B" }], author: "iris" });
    commitCase(w, caseId, proj, [{ bundle_id: lead, version_sha: pin }], deliveredCase);
    commitFinding(w, lead, deliveredFinding);
    put(lead);
  }
  w.doc(LOOSE);
  commitFinding(w, LOOSE, "founder");
  w.doc(OLD_LOOSE);
  commitFinding(w, OLD_LOOSE, undefined);
  return { w, env, proj };
}
async function assemble(w, env, caseId) {
  const cs = w.p.caseEditionState(caseId, 1, "test-group");
  assert.equal(cs.complete, true);
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs, via: "test" });
  assert.match(String(out.manifest_sha), /^[0-9a-f]{64}$/, `assembled ${caseId}: ${JSON.stringify(out).slice(0, 300)}`);
  return out;
}

test("R2 (deliverer) publishedList and publishedEditions name the signer and, beside it, who DELIVERED — the founder, a member, or undetermined, stated, where nothing was recorded", () => {
  const { w } = record();
  for (const list of [w.pr.publishedList(), w.read("publishedlist")]) {
    const row = (id) => list.bundles.find((b) => b.bundle_id === id);
    assert.deepEqual(list.bundles.map((b) => b.bundle_id).sort(), [LOOSE, OLD_LOOSE, LEAD, OLD_LEAD].sort());
    assert.deepEqual([row(LEAD).attestor_member, row(LEAD).delivered_by], ["iris", MEMBER_IS("gus")]);
    assert.deepEqual([row(LOOSE).attestor_member, row(LOOSE).delivered_by], ["iris", FOUNDER_IS]);
    for (const id of [OLD_LEAD, OLD_LOOSE]) {
      assert.equal(row(id).attestor_member, "iris", "the signer is still named");
      assert.ok(isUndetermined(row(id).delivered_by), `${id}: undetermined, never back-filled from iris: ${JSON.stringify(row(id).delivered_by)}`);
    }
    /* THE TABLE: no determined deliverer equals its signer */
    assert.deepEqual(list.bundles.filter((b) => kindOf(b.delivered_by) === `member:${b.attestor_member}`).map((b) => b.bundle_id), []);
  }
  for (const [id, want] of [[LEAD, "member:gus"], [LOOSE, "founder"], [OLD_LEAD, "undetermined"], [OLD_LOOSE, "undetermined"]]) {
    for (const eds of [w.pr.publishedEditions(id), w.read("publishededitions", { id })]) {
      assert.equal(eds.ok, true);
      assert.deepEqual(eds.editions.map((e) => [e.edition, e.attestor_member, kindOf(e.delivered_by)]), [[1, "iris", want]]);
      if (want === "undetermined") assert.ok(isUndetermined(eds.editions[0].delivered_by));
    }
  }
});

test("R3 (deliverer) publishedCase states who delivered its case document and each finding, and the manifest it serves says the same; a loose edition and the legacy rows likewise, undetermined never read off the signer", async () => {
  const { w, env } = record();
  const out = await assemble(w, env, CASE);
  const legacyOut = await assemble(w, env, LEGACY_CASE);
  for (const pc of [w.pr.publishedCase({ caseId: CASE }), w.pr.publishedCase({ id: LEAD }), w.read("publishedcase", { id: CASE })]) {
    assert.equal(pc.ok, true);
    const f = pc.findings[0];
    assert.deepEqual([f.bundle_id, f.attestor.member, f.delivered_by], [LEAD, "iris", MEMBER_IS("gus")]);
    assert.deepEqual([pc.document.attestor.member, pc.document.delivered_by], ["iris", FOUNDER_IS]);
    /* the manifest it serves beside the findings: the case document's deliverer is read there, the finding's too */
    assert.equal(pc.manifest_sha, out.manifest_sha);
    assert.deepEqual([pc.manifest.case_document.attestor.member, pc.manifest.case_document.delivered_by], ["iris", FOUNDER_IS]);
    assert.deepEqual([pc.manifest.findings[0].attestor.member, pc.manifest.findings[0].delivered_by], ["iris", MEMBER_IS("gus")]);
  }
  /* the loose edition: in no case, delivered by the founder */
  const loose = w.pr.publishedCase({ id: LOOSE });
  assert.deepEqual([loose.ok, loose.caseId, loose.findings[0].attestor.member, loose.findings[0].delivered_by],
                   [true, null, "iris", FOUNDER_IS]);
  /* the legacy rows: signer named, deliverer undetermined, on the finding, the document and the served manifest */
  const lc = w.pr.publishedCase({ caseId: LEGACY_CASE });
  assert.equal(lc.manifest_sha, legacyOut.manifest_sha);
  for (const [who, d] of [["finding", lc.findings[0]], ["document", lc.document], ["manifest document", lc.manifest.case_document],
                          ["manifest finding", lc.manifest.findings[0]]]) {
    assert.equal(d.attestor.member, "iris", `${who}: the signer is still named`);
    assert.ok(isUndetermined(d.delivered_by), `${who}: undetermined, not iris: ${JSON.stringify(d.delivered_by)}`);
  }
  const oldLoose = w.pr.publishedCase({ id: OLD_LOOSE });
  assert.equal(oldLoose.findings[0].attestor.member, "iris");
  assert.ok(isUndetermined(oldLoose.findings[0].delivered_by));
  /* the Worker's public case read relays the same */
  const r = await (await route(w, env, "publishedcase", { id: CASE })).json();
  assert.deepEqual([kindOf(r.findings[0].delivered_by), kindOf(r.manifest.case_document.delivered_by)], ["member:gus", "founder"]);
});

test("R6 (deliverer) the container a stranger holds carries delivered_by beside every attestor, and its verify sentence says which field the signature covers and which is this instance's record", async () => {
  const { w, env } = record();
  const readManifest = async (sha256) => {
    const zr = await route(w, env, "publishedbytes", { sha256, format: "zip" });
    assert.equal(zr.status, 200);
    const zip = new Uint8Array(await zr.arrayBuffer());
    const zc = await readContainer(zip);
    assert.equal(zc.ok, true);
    return JSON.parse(new TextDecoder().decode((await readPart(zip, zc, "MANIFEST.json")).bytes));
  };
  const man = await readManifest((await assemble(w, env, CASE)).manifest_sha);
  assert.deepEqual([man.format, man.case_document.attestor.member, kindOf(man.case_document.delivered_by),
                    man.findings[0].attestor.member, kindOf(man.findings[0].delivered_by)],
                   ["bio-case-container/6", "iris", "founder", "iris", "member:gus"]);
  assert.equal(typeof man.verify, "string");
  assert.match(man.verify, /`attestor` is who SIGNED/);
  assert.match(man.verify, /`delivered_by` is who DELIVERED/);
  assert.match(man.verify, /not covered by any\s+signature/i);
  assert.match(man.verify, /`undetermined` there means the delivery was not recorded; it never means the signer delivered it/);
  const legacy = await readManifest((await assemble(w, env, LEGACY_CASE)).manifest_sha);
  assert.equal(legacy.format, "bio-case-container/6");
  for (const d of [legacy.case_document, legacy.findings[0]]) {
    assert.equal(d.attestor.member, "iris");
    assert.ok(isUndetermined(d.delivered_by), `the legacy container states undetermined: ${JSON.stringify(d.delivered_by)}`);
  }
  assert.match(legacy.verify, /not covered by any\s+signature/i);
});
