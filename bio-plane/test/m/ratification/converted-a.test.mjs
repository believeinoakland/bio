/* CONVERTED (T18, the ratification job): ratification's share of four old suites, as requirement-named module tests
   at this module's interface — `test/caseproduction.test.mjs`, `test/d84-case-manifest.test.mjs`,
   `test/mk6-bundle-names-no-author.test.mjs` and `test/signer-enrolment.test.mjs` (their rows in
   `build/jobs/T17/legacy-tests.md`). Only ratification's share is converted here; the other modules' shares of those
   suites (case-authoring, affordances, inquiry, bias, provenance, publication, membership) are theirs. The old suites
   were not deleted by this job (K619).

   Every test drives ratification through its interface: the store half (`ratificationOf` via the fixture's world,
   `w.r`, `w.op`), the Worker half (`caseRatifyOp`, `ratifyOp` with `plane(w)`), promotion's case gate running the
   catalogue this module registered (R8), and the exported pure functions (`checkCaseDocument`, `CASE_MEMBER_ROLES`).
   Where an old suite drove a case document `op=publish` authored (case-authoring's, not a module ratification uses),
   an equivalent bio-case-document/5 is built by hand with the fixture's `cleanCase`/`fmText`/`caseMd`, and the test
   says so. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signCase, signBundle, cleanCase, cleanInfoMd, fmText, caseMd, CASE_BODY, V }
  from "./fixture.mjs";
import { caseRatifyOp, ratifyOp } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines, checkCaseDocument, CASE_MEMBER_ROLES } from "../../../src/ratification/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";

const Q1 = "INQ-2026-0001-first", Q2 = "INQ-2026-0002-second", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };
const SIG = "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n";
const PIN = "a".repeat(64);
const HEX = (c) => c.repeat(64);

/* The case ceremony over a hand-built /5 document (the equivalent of the one case-authoring's op=publish authors):
   alice owns P and holds a registered key; bo joined P. `mutate` edits the document object before it is stored. */
async function caseWorld({ mutate = (d) => d, body = CASE_BODY } = {}) {
  const w = world();
  const key = await newKey();
  w.member("alice", { signer: key }); w.member("bo");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = mutate(cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] }), P);
  const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body });
  const docSha = w.caseDoc(CASE, 1, text);
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                                 attribution: { reached: [], legacy: [], stated: [], current: [] },
                                 signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  const sig = await signCase(key, CASE, 1, docSha);
  const run = async (o = {}) => {
    const p = plane(w, o);
    return caseRatifyOp(p.request({ caseId: CASE, edition: 1, expectedSha: docSha, sig }), p.stub, p.ctx);
  };
  return { w, P, text, docSha, run };
}

/* ============================================================ caseproduction.test.mjs (§8, §9, §10) */

/* §10 (D-450, BIO_Publication §3 rule 14): the one-axis bar. The old suite mutated the document op=publish really
   authored; here the same /5 shape is built by hand (case-authoring's authoring is not this module's). */
const ONE_AXIS = { declared: true, capture: "B", connection: null };
const c4112 = (fm) => checkCaseDocument(fm, { caseId: CASE, edition: 1 }).filter((x) => x.check === "C-41.12").length;

test("R8 (caseproduction §10, D-450): C-41.12 admits a bar declared on one axis with the other null, and still fires on an omitted key, a non-grade and a bar on neither axis", async () => {
  const doc = cleanCase({ caseId: CASE, edition: 1, project: "PROJ-2026-0001-team", members: [{ id: Q1, pin: PIN }] });
  doc.required_strength = { ...ONE_AXIS };
  /* read back from the bytes, as a signer's gate reads it: the unset axis is written `null` and parses as null */
  const text = fmText(doc, { body: CASE_BODY });
  assert.match(text, /required_strength:\n {2}declared: true\n {2}capture: "B"\n {2}connection: null\n/);
  const fm = parseFrontmatter(text).data;
  assert.deepEqual(fm.required_strength, ONE_AXIS, "the pair stays a pair: both keys present, the unset one null");
  assert.deepEqual(checkCaseDocument(fm, { caseId: CASE, edition: 1, body: parseFrontmatter(text).body }), [],
    "the one-axis document as written draws no finding at all");
  const arm = (mutate) => { const d = structuredClone(fm); mutate(d.required_strength); return c4112(d); };
  assert.deepEqual([arm(() => {}),
                    arm((rq) => { delete rq.connection; }),
                    arm((rq) => { rq.connection = "E"; }),
                    arm((rq) => { rq.capture = null; })], [0, 1, 1, 1]);
  const both = structuredClone(fm); both.required_strength = { declared: true, capture: "B", connection: "B" };
  assert.equal(c4112(both), 0, "negative control: a two-axis bar is admitted too");
});

test("R2, R3, R8 (caseproduction §10): a one-axis bar's case document is signed through op=caseratify and its bar committed as signed; a non-grade on the unset axis is GATE_REFUSED on C-41.12 alone", async () => {
  const ok = await caseWorld({ mutate: (d) => ({ ...d, required_strength: { ...ONE_AXIS } }) });
  const r = await ok.run();
  assert.deepEqual([r.status, r.body.ok, r.body.caseId], [200, true, CASE], JSON.stringify(r.body).slice(0, 400));
  assert.deepEqual(ok.w.pub.committed[0].bar, ONE_AXIS, "the bar committed is the signed pair, the unset axis null");
  assert.deepEqual(JSON.parse(ok.w.row(`SELECT bar FROM published_cases WHERE case_id=?`, CASE).bar), ONE_AXIS);
  assert.deepEqual(ok.w.row(`SELECT project_id FROM cases WHERE case_id=?`, CASE), { project_id: ok.P },
    "the case is on the record for its project");
  const bad = await caseWorld({ mutate: (d) => ({ ...d, required_strength: { ...ONE_AXIS, connection: "E" } }) });
  const g = await bad.run();
  assert.deepEqual([g.status, g.body.reason, g.body.findings.map((x) => x.check)], [409, "GATE_REFUSED", ["C-41.12"]]);
  assert.equal(bad.w.pub.committed.length, 0, "nothing committed");
});

/* §8: the record commits what was SIGNED — the `cases` row's project and each member's role come from the case
   document's own bytes; the committer's arguments carry neither. */
function commitWorld() {
  const w = world();
  for (const m of ["alice", "bo"]) w.member(m);
  const P = w.project("Team", "alice", { joined: ["bo"] });
  const P2 = w.project("Other", "alice");
  w.inquiry(Q1); w.inquiry(Q2);
  for (const p of [P, P2]) for (const q of [Q1, Q2]) w.bv.conc.set(w.key(p, q), OWN);
  const members = [{ id: Q1, pin: w.sha(Q1), role: "load_bearing" }, { id: Q2, pin: w.sha(Q2), role: "supporting" }];
  const store = (edition, project, ms = members) => {
    const rows = ms.map((m) => [m.id, w.r.caseConclusionFor(project, m.id, V("alice"), "open")]);
    return w.caseDoc(CASE, edition, caseMd({ caseId: CASE, edition, project, members: ms, conclusions: rows,
                                             rowLines: caseConclusionRowLines }));
  };
  const commit = (edition, docSha, o = {}) => w.r.ratifyCaseDocument({ caseId: CASE, edition, docSha, sigArmored: SIG,
    attestorKey: "KEY", attestorMember: "alice", gateVersion: "plane-gate/1.0", deliveredBy: V("alice"), ...o });
  return { w, P, P2, members, store, commit };
}

test("R3, R13 (caseproduction §8): the `cases` row names the project the signed case document names, and each member row carries the role the document designates — from the signed bytes, never the request", async () => {
  for (const which of ["P", "P2"]) {
    const { w, P, P2, members, store, commit } = commitWorld();
    const project = which === "P" ? P : P2;
    const r = await commit(1, store(1, project));
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
    assert.deepEqual(w.row(`SELECT project_id FROM cases WHERE case_id=?`, CASE), { project_id: project }, which);
    assert.deepEqual(w.st.sql.exec(`SELECT bundle_id, role FROM published_case_members WHERE case_id=? ORDER BY ord`, CASE),
      members.map((m) => ({ bundle_id: m.id, role: m.role })), which);
    assert.equal(w.pub.committed[0].project, project, "what publication was handed is the signed project");
  }
  /* the partition follows the bytes: the same members, the roles swapped in the document, commit swapped */
  const { w, P, store, commit } = commitWorld();
  const swapped = [{ id: Q1, pin: w.sha(Q1), role: "supporting" }, { id: Q2, pin: w.sha(Q2), role: "load_bearing" }];
  assert.equal((await commit(1, store(1, P, swapped))).ok, true);
  assert.deepEqual(w.st.sql.exec(`SELECT bundle_id, role FROM published_case_members WHERE case_id=? ORDER BY ord`, CASE),
    [{ bundle_id: Q1, role: "supporting" }, { bundle_id: Q2, role: "load_bearing" }]);
});

test("R3 (caseproduction §8): a later edition naming another producing project is CASE_PRODUCTION_DIVERGED and commits nothing — a case does not change hands; the same project's next edition commits", async () => {
  const { w, P, P2, store, commit } = commitWorld();
  assert.equal((await commit(1, store(1, P))).ok, true);
  const n = w.pub.committed.length;
  const moved = await commit(2, store(2, P2));
  assert.deepEqual([moved.ok, moved.reason, moved.declared, moved.signed], [false, "CASE_PRODUCTION_DIVERGED", P, P2]);
  assert.equal(w.pub.committed.length, n, "nothing was handed to publication");
  assert.equal(w.row(`SELECT ratified_at FROM case_documents WHERE case_id=? AND edition=2`, CASE).ratified_at, null);
  assert.deepEqual(w.row(`SELECT project_id FROM cases WHERE case_id=?`, CASE), { project_id: P });
  const { w: w2, P: Q, store: s2, commit: c2 } = commitWorld();
  assert.equal((await c2(1, s2(1, Q))).ok, true);
  assert.equal((await c2(2, s2(2, Q))).ok, true, "negative control: the same project's next edition is not refused");
  assert.equal(w2.pub.committed.length, 2);
});

test("R5 (caseproduction §8): once the case document is committed, a member at the pinned sha crosses by op=ratify's commit under an owner's signature, and a joined non-owner's signature is refused", async () => {
  const { w, P, store, commit } = commitWorld();
  assert.equal((await commit(1, store(1, P))).ok, true);
  const args = (o = {}) => ({ bundleId: Q1, bundleSha: w.sha(Q1), attestorKey: "K", attestorMember: "alice",
    gateVersion: "g", sigArmored: "s", shas: [{ sha256: w.sha(Q1), path: "bundle.md", kind: "bundle", bytes: 1 }],
    edges: [], deliveredBy: V("alice"), ...o });
  const bo = w.r.publish(args({ attestorMember: "bo", deliveredBy: V("bo") }));
  assert.deepEqual([bo.ok, bo.reason], [false, "CASE_SIGNER_NOT_AN_OWNER"]);
  assert.equal(w.count("published_bundles"), 0);
  const r = w.r.publish(args());
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual(w.row(`SELECT bundle_id, attestor_member FROM published_bundles WHERE bundle_id=?`, Q1),
    { bundle_id: Q1, attestor_member: "alice" });
});

test("R8, R9 (caseproduction §9): CASE_MEMBER_ROLES is the two terms; C-41.8 admits each and refuses any other, and the commit stores the designation as signed", async () => {
  assert.deepEqual(CASE_MEMBER_ROLES, ["load_bearing", "supporting"]);
  const base = cleanCase({ caseId: CASE, edition: 1, project: "PROJ-2026-0001-team",
                           members: [{ id: Q1, pin: PIN }, { id: Q2, pin: HEX("b") }] });
  const roled = (role) => { const d = structuredClone(base); d.case_roles[1].role = role; return d; };
  for (const role of CASE_MEMBER_ROLES)
    assert.deepEqual(checkCaseDocument(roled(role), { caseId: CASE, edition: 1 }).map((x) => x.check), [], role);
  for (const role of ["critical", "", "Load_Bearing"])
    assert.ok(checkCaseDocument(roled(role), { caseId: CASE, edition: 1 }).some((x) => x.check === "C-41.8"), role);
  const { w, P, store, commit } = commitWorld();
  assert.equal((await commit(1, store(1, P))).ok, true);
  assert.deepEqual([...new Set(w.st.sql.exec(`SELECT role FROM published_case_members`).map((r) => r.role))].sort(),
    [...CASE_MEMBER_ROLES].sort(), "both terms are stored as the document designates them");
});

/* ============================================================ d84-case-manifest.test.mjs (§1, §2, §5) */

/* The /5 documents op=publish authors, built by hand (case-authoring's authoring is not this module's): one with no lens
   in force, one stamped with a lens of two pairs and its hash. */
const LENS_PAIRS = [{ bundle_id: "BIAS-2026-8400-instance", revision: HEX("1"), scope: "instance" },
                    { bundle_id: "BIAS-2026-8400-project", revision: HEX("2"), scope: "project" }];
const LENS_SHA = HEX("5");
const lensed = (d, P = "PROJ-2026-0001-team") => ({
  ...d,
  bias_manifest: { in_force: true, stated: "a manifest was in force", statements_sha: LENS_SHA, scope: "project",
                   scope_id: P, pins_proposed: 0, pins_proposed_stated: "no adoption pinned a proposed revision" },
  bias_manifest_bundles: LENS_PAIRS.map((p) => ({ ...p })) });
const LENS_BODY = `${CASE_BODY}\n## Bias Manifest\n\n`
  + LENS_PAIRS.map((p) => `- ${p.bundle_id} (${p.scope}) at revision ${p.revision}`).join("\n")
  + `\n\nHash of the effective statement set: ${LENS_SHA}.\n\n## Bias Acknowledgement\n\nwe expected them late\n`;
const d84Docs = () => {
  const plain = cleanCase({ caseId: CASE, edition: 1, project: "PROJ-2026-0001-team", members: [{ id: Q1, pin: PIN }] });
  /* through the bytes and back, as the gate reads a signed document */
  const read = (d, body) => parseFrontmatter(fmText(d, { body })).data;
  return { FA: read(plain, CASE_BODY), FB: read(lensed(plain), LENS_BODY) };
};

test("R8 (d84 §1, §2): the case gate promotion runs with this module's catalogue accepts a /6 document, and a /5 one as written, with no lens in force and one naming each pair and the hash", async () => {
  const w = world();
  const { FA, FB } = d84Docs();
  assert.deepEqual([FA.format, FA.bias_manifest.in_force, FA.bias_manifest.stated, FA.bias_manifest_bundles],
    ["bio-case-document/6", false, "no manifest was in force", []]);
  assert.deepEqual([FB.bias_manifest.in_force, FB.bias_manifest.statements_sha, FB.bias_manifest_bundles.length],
    [true, LENS_SHA, 2]);
  /* K1321: the catalogue still accepts a /5 document as written (case-grammar R1); only publication's commit refuses it */
  const v5 = ({ method, materials, material_attestations, ...rest }) => ({ ...rest, format: "bio-case-document/5" });
  for (const [fm, body] of [[FA, CASE_BODY], [FB, LENS_BODY], [v5(FA), CASE_BODY], [v5(FB), LENS_BODY]]) {
    const g = w.promotion.runCaseGate({ caseId: CASE, edition: 1, fm, priorCase: null, body });
    assert.deepEqual([g.ok, g.findings.map((x) => x.check)], [true, []], fm.bias_manifest.stated);
  }
});

test("R2, R8 (d84 §2): a /6 case document stamped with a lens in force is signed through op=caseratify", async () => {
  const { w, run } = await caseWorld({ mutate: (d, P) => lensed(d, P), body: LENS_BODY });
  const r = await run();
  assert.deepEqual([r.status, r.body.ok], [200, true], JSON.stringify(r.body).slice(0, 400));
  assert.equal(w.pub.committed.length, 1);
  assert.notEqual(w.row(`SELECT ratified_at FROM case_documents WHERE case_id=?`, CASE).ratified_at, null);
});

test("R8 (d84 §5, REC-188): C-41.13 refuses a /3-or-later document silent about the lens or its second readers, by C-41.13 alone; a /2 document without them passes; a real acknowledgement passes", async () => {
  const w = world();
  const { FA, FB } = d84Docs();
  const gate = (fm, body = null) => w.promotion.runCaseGate({ caseId: CASE, edition: 1, fm, priorCase: null, body });
  const ids = (g) => g.findings.map((x) => x.check);
  const without = (fm, key) => { const d = structuredClone(fm); delete d[key]; return d; };
  assert.deepEqual([gate(FA, CASE_BODY).ok, gate(FB, LENS_BODY).ok], [true, true], "baseline: both documents pass");
  assert.deepEqual([gate(without(FB, "bias_manifest")).ok, ids(gate(without(FB, "bias_manifest")))], [false, ["C-41.13"]],
    "no bias_manifest map");
  assert.deepEqual(ids(gate({ ...FB, bias_manifest: "none" })), ["C-41.13"], "a scalar manifest");
  assert.deepEqual(ids(gate({ ...FB, bias_manifest: { ...FB.bias_manifest, statements_sha: null } })), ["C-41.13"],
    "a lens in force with no hash");
  assert.deepEqual(ids(gate({ ...FA, bias_manifest: { ...FA.bias_manifest, stated: "" } })), ["C-41.13"],
    "no lens in force, and not said");
  assert.deepEqual(ids(gate(without(FB, "completeness_acknowledgements"))), ["C-41.13"], "no acknowledgement list");
  const noCount = structuredClone(FB); delete noCount.completeness.acknowledged;
  assert.deepEqual(ids(gate(noCount)), ["C-41.13"], "no acknowledgement count");
  const bare = without(without(without(FB, "bias_manifest"), "bias_manifest_bundles"), "completeness_acknowledgements");
  delete bare.completeness.acknowledged;
  assert.deepEqual([gate({ ...bare, format: "bio-case-document/2" }, LENS_BODY).ok,
                    ids(gate({ ...bare, format: "bio-case-document/2" }, LENS_BODY))], [true, []],
    "the same document as a /2 carries neither and still passes: what already crossed stays crossed");
  assert.deepEqual([gate(bare, LENS_BODY).ok, ids(gate(bare, LENS_BODY))], [false, ["C-41.13", "C-41.13", "C-41.13"]],
    "its /5 twin is refused on the manifest, the count and the list, by C-41.13 alone");
  const acked = { ...FB, completeness: { ...FB.completeness, acknowledged: 1 },
                  completeness_acknowledgements: [{ kind: "recipient", by: "RG-1", recipient: "a reader",
                                                    at: "2026-07-02T00:00:00Z" }] };
  assert.deepEqual(ids(gate(acked, LENS_BODY)), [], "over-strictness: a real acknowledgement on the list passes");
});

/* ============================================================ mk6-bundle-names-no-author.test.mjs (§2) */

const DOC = "INFO-2026-0001-report", FIND = "INQ-2026-0001-finding";

test("R6 (mk6 §2): op=ratify copies to the published store only the bundle's publishable files, by hash; its `_history/` files, which name the promoting member, never cross and are not in the commit's file list", async () => {
  const w = world();
  const key = await newKey();
  w.member("alice", { signer: key });
  const P = w.project("Team", "alice");
  /* promoted by alice (the fixture's promoting member): the working record holds its `_history/` audit */
  w.promote(DOC, cleanInfoMd(DOC), "information");
  w.pub.resting.set(DOC, [{ case_id: CASE, finding: FIND, project: P }]);
  const image = w.record.readImage(DOC);
  const history = Object.keys(image).filter((k) => k.startsWith("_history/"));
  assert.ok(history.length >= 2, "fixture: the image the act reads carries the working record's history files");
  assert.ok(history.some((k) => image[k].includes("member:alice")), "fixture: and they name the promoting member");
  assert.equal(image["bundle.md"].includes("alice"), false, "fixture: the bundle's own file names nobody");
  const p = plane(w);
  const sha = w.sha(DOC);
  const r = await ratifyOp(p.request({ bundleId: DOC, expectedSha: sha, sig: await signBundle(key, DOC, sha) }), p.stub, p.ctx);
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 400));
  const published = [...p.published.entries()].map(([k, v]) => ({ k, text: new TextDecoder().decode(v) }));
  assert.deepEqual(published.map((o) => o.k), [`s/published/${sha}`], "the one publishable file, under its hash");
  assert.equal(published[0].text, image["bundle.md"], "negative control: the matcher reads the bytes that crossed");
  assert.deepEqual(published.filter((o) => /alice/.test(o.k + o.text)).map((o) => o.k), [],
    "no published object names the promoting member");
  const [, a] = w.calls.find((c) => c[0] === "commitEdition");
  assert.deepEqual(a.shas.map((s) => s.path), ["bundle.md"], "no `_history/` path is handed to the commit");
});

/* ============================================================ signer-enrolment.test.mjs (§4) */

test("R4, R7 (signer-enrolment §4): the gate's signers are credentials' attesting keys (K757); a revoked member's key, an invited member's key and an unregistered key are SIG_UNKNOWN_KEY naming the key; an active non-owner's key is weighed and refused on standing; the owner's crosses", async () => {
  const w = world();
  const K = { alice: await newKey(), bo: await newKey(), jonah: await newKey(), kestrel: await newKey(),
              stranger: await newKey() };
  for (const m of ["alice", "bo", "jonah", "kestrel"]) w.member(m, { signer: K[m] });
  const P = w.project("Team", "alice", { joined: ["bo"] });
  /* the legacy rows no op writes once membership's guards stand: an active key under a revoked or invited member */
  w.st.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='jonah'`);
  w.st.sql.exec(`UPDATE members SET status='invited' WHERE member_id='kestrel'`);
  w.promote(DOC, cleanInfoMd(DOC), "information");
  w.pub.resting.set(DOC, [{ case_id: CASE, finding: FIND, project: P }]);
  const sha = w.sha(DOC);
  const attesting = w.credentials.attestingKeys().map((k) => k.key_b64).sort();
  assert.deepEqual(attesting, [K.alice.keyB64, K.bo.keyB64].sort(), "fixture: two of the four registered keys attest");
  const facts = w.op("gatefacts", { id: DOC, viewer: V("alice") });
  assert.deepEqual(facts.signers.map((s) => s.key_b64).sort(), attesting, "R7: the gate reads credentials' one predicate (its R11)");
  const weigh = async (who) => {
    const p = plane(w);
    return ratifyOp(p.request({ bundleId: DOC, expectedSha: sha, sig: await signBundle(K[who], DOC, sha) }), p.stub, p.ctx);
  };
  const out = {};
  for (const who of ["jonah", "kestrel", "stranger", "bo"]) out[who] = await weigh(who);
  for (const who of ["jonah", "kestrel", "stranger"])
    assert.deepEqual([out[who].status, out[who].body.reason, out[who].body.keyB64], [403, "SIG_UNKNOWN_KEY", K[who].keyB64], who);
  assert.equal(out.bo.body.reason, "CASE_SIGNER_NOT_AN_OWNER", "bo's key was accepted; the refusal is his standing");
  assert.equal(w.count("published_bundles"), 0);
  out.alice = await weigh("alice");
  assert.deepEqual([out.alice.status, out.alice.body.ok, out.alice.body.attestor], [200, true, "alice"]);
  const accepted = Object.entries(out).filter(([, r]) => r.body.reason !== "SIG_UNKNOWN_KEY").map(([k]) => K[k].keyB64).sort();
  assert.deepEqual(accepted, attesting, "the gate accepts a signature exactly from the keys credentials says attest");
});
