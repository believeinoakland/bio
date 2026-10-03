/* Converts the old suite `bio-plane/test/publishedcase.test.mjs` (REC-22 and its successors: op=publishedcase and
   op=publishedbytes, the public read path, over editions) — its public-read share, in public-read's ids:
     R3  the per-finding fields of the public read (blocks 1-2); two editions' hashes each resolving to their own
         edition (block 5); a division disclosure, named and never served (block 6); the loose branch, a ratified
         bundle in no case, with its full contract (block 8, M0-11);
     R5, R6  the Worker's response headers for published bytes and for the container (blocks 3-4); the zip's
         MANIFEST.json byte-identical to the stored manifest (block 4); NO_PUBLISHED_PART for an object planted in the
         published bucket under a sha nothing published names (block 3's adversary); CONTAINER_TOO_LARGE answering 413
         through the op (D-561's arm).
   The control-plane 401 arms, the source-text arms (block 7, D-549's one-site pin), REC-117's override and the purge
   arm are other modules' shares. The old suite drove the whole plane under Miniflare with real ssh-keygen
   signatures; here the same facts are built through the fixture's world as ratification builds them (the case
   document prepared and signed through `commitCaseEdition`, each member through `commitEdition` with the graph
   `publishedGraphEdges` classifies from its bytes, the container through the Worker's `assembleCaseContainer`), and
   the module is driven at its interface: its ops (`w.read`) and the Worker's `publishedRoutes` over this module's op
   map (`stubOf`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, sha, SIG, KEY } from "./fixture.mjs";
import { publishedGraphEdges } from "../../../src/case-grammar/index.mjs";
import { rowOf } from "../../../src/public-read/checks.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { CONTAINER_MAX_BYTES } from "../../../src/container.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";

/* The control plane's helpers, bound as the plane binds them (publication's worker.test's binding). */
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, StoreSilent: class extends Error {}, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent",
  PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

/* A stranger's request: no credential exists anywhere in this function. */
const call = async (w, env, op, q = {}) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};
const anonCase = async (w, env, q) => (await call(w, env, "publishedcase", q)).json();
const bytesOf = async (r) => new Uint8Array(await r.arrayBuffer());
const pubKey = (s) => `bio/published/${s}`;

const CASE = "CASE-2026-2200";
const F = "INQ-2026-2200-case";
const DOC_CAP = "INFO-2026-2200-capture-b";
const DOC_CONN = "INFO-2026-2200-connection-c";
const LEFTOUT = "INFO-2026-2200-left-out";
const T0 = "2026-09-28T00:30:00Z", T1 = "2026-09-28T01:00:00Z", T2 = "2026-09-29T01:00:00Z";
const BAR = { declared: true, capture: "B", connection: "C" };
const STMT1 = "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.";
const STMT2 = "This case covers the FY2024 transfer and, as of edition 2, the FY2023 comparison memo.";
const COMPLETENESS1 = { statement: STMT1, subject_position: "sought_and_answered",
                        subject_justification: "We put the four claims to the City Administrator and printed the reply.",
                        author: "olive" };
/* A captured part travels with the finding, so the container carries a blob and not only text. */
const CAPTURE = new Uint8Array(512).map((_, i) => (i * 7) % 251);
const CAP_SHA = sha(Buffer.from(CAPTURE));

/* CASE-2026-2200 edition 1 over F, signed and complete, its container assembled; F rests on two documents, one of
   them (DOC_CONN) ratified as evidence in no case — the loose branch's bytes. Every published object in the bucket. */
async function publishedWorld() {
  const w = world();
  w.member("olive");
  const proj = w.project("Sewer transfer", "olive");
  for (const d of [DOC_CAP, DOC_CONN, LEFTOUT]) w.doc(d);
  const loose = w.signFinding(DOC_CONN, { title: "Info connection", sig: SIG(21), at: T0 });
  assert.equal(loose.ok, true, "fixture: the evidence document ratified");
  assert.equal(loose.caseCount, 0, "fixture: and it is in no case");
  w.inquiry(F, { question: "Was the sewer transfer authorised?", legs: [{ target: DOC_CAP }, { target: DOC_CONN }] });
  const pin = w.head(F);
  w.prepare(CASE, 1, { format: "bio-case-document/5", project: proj, roles: [{ target: F, version_sha: pin, role: "load_bearing" }],
    strength: [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }],
    excluded: [{ target: LEFTOUT, description: "the FY2023 comparison memo", reason: "a records request is outstanding" }] });
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }],
                                     completeness: COMPLETENESS1, bar: BAR, sig: SIG(1), at: T1 }).ok, true);
  const text = w.text(F);
  const fin = w.signFinding(F, { title: "Finding F", sig: SIG(11), at: T1, edges: publishedGraphEdges(w.fm(F)),
    shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) },
           { sha256: CAP_SHA, path: "snapshots/memo.bin", kind: "capture", bytes: CAPTURE.length }] });
  assert.equal(fin.ok, true, "fixture: the finding ratified");
  assert.equal(fin.case.complete, true, "fixture: and completed the case edition");
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(pubKey(pin), new TextEncoder().encode(text));
  env.PUBLISHED.m.set(pubKey(CAP_SHA), CAPTURE);
  env.PUBLISHED.m.set(pubKey(w.head(DOC_CONN)), new TextEncoder().encode(w.text(DOC_CONN)));
  const container = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", via: "test",
                                                  cs: w.p.caseEditionState(CASE, 1, "test-group") });
  assert.match(container.manifest_sha || "", /^[0-9a-f]{64}$/, "fixture: the container assembled");
  return { w, env, proj, pin, text, manifestSha: container.manifest_sha };
}

test("R3 (blocks 1-2) the public read answers the case, with each finding's own fields, from the store op and through the Worker", async () => {
  const { w, env, pin, text, manifestSha } = await publishedWorld();
  /* ---- the store side, at this module's op ---- */
  const s = w.read("publishedcase", { id: F });
  assert.deepEqual([s.ok, s.caseId, s.asked, s.edition, s.latest_edition], [true, CASE, F, 1, 1],
                   "a finding's id answers with the case it serves, naming which finding was asked for");
  assert.deepEqual(s.findings.map((f) => f.bundle_id), [F]);
  assert.equal("strength" in s, false, "no case-level strength anywhere at the case's altitude");
  assert.deepEqual(["opened" in s, "ratified_at" in s, s.ratified_at], [false, true, T1], "`opened` is not published");
  assert.deepEqual([s.scope, s.project !== null, s.bar, s.bias_acknowledgement], ["The question.", true, BAR, "none declared"]);
  assert.match(s.bar_detail, /standard of evidence this case was held to/);
  assert.deepEqual(s.completeness, COMPLETENESS1, "completeness travels as recorded, with its position and justification");
  assert.deepEqual([s.complete, s.awaiting], [true, []]);
  assert.equal(s.document.doc_sha, w.row(`SELECT doc_sha FROM case_documents`).doc_sha, "the signed case document is served");
  const f = s.findings[0];
  /* Each member's own fields, by name. */
  assert.deepEqual(
    [f.ord, f.bundle_id, f.title, f.bundle_sha, f.version_sha, f.edition, f.role, f.ratified_at, f.gate_version, f.sig_armored],
    [0, F, "Finding F", pin, pin, 1, "load_bearing", T1, "plane-gate/test", SIG(11)]);
  assert.deepEqual(f.attestor, { member: "olive", key_b64: KEY }, "the attestation is public and per finding");
  assert.deepEqual(f.delivered_by, { kind: "member", member: "olive" }, "the deliverer is its own fact (R12)");
  assert.deepEqual(f.strength.map((a) => [a.axis, a.state, a.grade]), [["capture", "graded", "B"], ["connection", "graded", "C"]],
                   "both frozen axes, per finding, as the case document states them — never one letter");
  assert.deepEqual([f.frozen_from, Array.isArray(f.grounds)], ["case_document", true], "the pair and grounds are the case document's");
  assert.match(f.case_excludes, /Nothing else\./, "the exclusions from the case document");
  assert.deepEqual(f.required, BAR, "the declared bar beside the pair");
  assert.deepEqual(f.parts.map((p) => [p.path, p.sha256, p.kind, p.bytes]),
                   [["bundle.md", pin, "bundle", Buffer.byteLength(text)], ["snapshots/memo.bin", CAP_SHA, "capture", 512]]);
  /* The graph, per finding: the published document F rests on is SERVED, the unpublished one is not in the graph. */
  assert.deepEqual(f.serves.map((e) => [e.to, e.kind, e.edition, e.title, e.bundle_sha, e.case_id, e.cases, e.manifest_sha]),
                   [[DOC_CONN, "cites", 1, "Info connection", w.head(DOC_CONN), null, [], null]]);
  assert.equal(f.serves.some((e) => e.to === DOC_CAP) || f.names.some((e) => e.to === DOC_CAP), false,
               "an unpublished target is neither served nor named");
  assert.deepEqual([f.names, f.unresolved, f.division.parent, f.division.siblings], [[], [], null, []]);
  assert.equal(f.tensions, null, "a /4 document states no tensions (R13)");
  assert.equal(s.manifest_sha, manifestSha);
  assert.deepEqual(s.files, s.manifest.parts.map((p) => ({ path: p.path, sha256: p.sha256, kind: p.kind, bytes: p.bytes, finding: p.finding })));
  assert.deepEqual(s.files.filter((p) => p.kind === "capture").map((p) => [p.path, p.finding, p.sha256, p.bytes]),
                   [[`${F}/snapshots/memo.bin`, F, CAP_SHA, 512]], "every part with its sha and bytes, namespaced by finding");
  assert.ok(s.files.every((p) => /^[0-9a-f]{64}$/.test(p.sha256)), "every part answerable by hash");
  assert.deepEqual([s.editions, s.edition_index], [[1], [{ edition: 1, ratified_at: T1, manifest_sha: manifestSha, withdrawn: null }]]);
  /* The case's own id answers the same case, without `asked`. */
  const byCase = w.read("publishedcase", { id: CASE });
  assert.deepEqual([byCase.caseId, "asked" in byCase], [CASE, false]);
  /* ---- through the Worker: the body rendered from the published bytes, the basis, the verification pointers ---- */
  const r = await call(w, env, "publishedcase", { id: F });
  assert.equal(r.status, 200);
  const c = await r.json();
  const wf = c.findings[0];
  assert.deepEqual([c.ok, c.caseId, c.asked, "strength" in c, "opened" in c], [true, CASE, F, false, false]);
  assert.deepEqual([wf.object_type, wf.bytes], ["inquiry", `op=publishedbytes&sha256=${pin}`]);
  assert.deepEqual([wf.body.state, wf.body.from_sha], ["published", pin], "the body from the bytes the signature covers (D-1)");
  assert.match(wf.body.question, /Was the sewer transfer authorised\?/);
  assert.deepEqual([wf.body.excludes_from, wf.body.excludes], ["case_document", f.case_excludes]);
  assert.deepEqual(Object.keys(wf.body.authored).sort(), ["conclusion", "falsifier", "falsifier_override"]);
  assert.deepEqual(wf.basis.map((l) => [l.target, l.served]), [[DOC_CAP, false], [DOC_CONN, true]],
                   "a leg on unpublished material is NAMED, a leg on a published edition is served");
  assert.match(wf.basis[0].detail, /can hand over nothing of it/);
  assert.deepEqual([wf.basis[0].cited_edition, wf.basis[1].cited_edition.bundle_sha], [null, w.head(DOC_CONN)]);
  assert.deepEqual(c.verification.findings, [{ bundle_id: F, bytes: `op=publishedbytes&sha256=${pin}` }]);
  assert.deepEqual([c.verification.container, c.verification.manifest],
                   [`op=publishedbytes&sha256=${manifestSha}&format=zip`, `op=publishedbytes&sha256=${manifestSha}`]);
  assert.match(c.verification.detail, /tamper-EVIDENT/);
  assert.match(c.verification.detail, /Nothing here prevents a modified copy/, "never claimed tamper-proof");
  /* Every per-finding store field reaches the stranger unchanged. */
  for (const k of Object.keys(f)) assert.deepEqual(wf[k], f[k], `the Worker relays the finding's ${k}`);
});

test("R3 (block 1) nothing published answers NOT_PUBLISHED, one answer for never-published, never-existed and an edition that does not exist", async () => {
  const { w, env } = await publishedWorld();
  w.inquiry("INQ-2026-2200-working");
  const working = w.read("publishedcase", { id: "INQ-2026-2200-working" });
  const never = w.read("publishedcase", { id: "INQ-2026-9999-nothing" });
  const noEdition = w.read("publishedcase", { id: F, edition: 7 });
  assert.deepEqual([working.reason, working.check], ["NOT_PUBLISHED", "C-98.8"]);
  assert.equal(JSON.stringify(working), JSON.stringify(never), "the public surface cannot test for existence");
  assert.equal(JSON.stringify(noEdition), JSON.stringify(never));
  assert.equal(w.read("publishedcase", { sha256: w.head("INQ-2026-2200-working") }).reason, "NOT_PUBLISHED");
  const r = await call(w, env, "publishedcase", { id: "INQ-2026-9999-nothing" });
  assert.equal(r.status, 404);
  assert.deepEqual((({ reason, check, translation }) => [reason, check, translation])(await r.json()),
                   ["NOT_PUBLISHED", "C-98.8", rowOf("NOT_PUBLISHED").translation]);
  const none = await call(w, env, "publishedcase", {});
  assert.equal(none.status, 400);
  assert.match((await none.json()).error, /requires id=/, "neither id nor sha: told how to ask, not what exists");
});

test("R3, R1 (block 5) a second edition: each edition's hash resolves to its own edition, and edition 1 still answers and verifies", async () => {
  const { w, env, proj, pin: pin1, manifestSha: m1 } = await publishedWorld();
  w.inquiry(F, { question: "Was the sewer transfer authorised, on the comparison memo too?",
                 legs: [{ target: DOC_CAP }, { target: DOC_CONN }] });
  const pin2 = w.head(F);
  assert.notEqual(pin2, pin1);
  w.prepare(CASE, 2, { format: "bio-case-document/5", project: proj, roles: [{ target: F, version_sha: pin2, edition: 2, role: "load_bearing" }],
    strength: [{ target: F, axis: "capture", grade: "B" }, { target: F, axis: "connection", grade: "C" }] });
  assert.equal(w.signCase(CASE, 2, { project: proj, roster: [{ bundle_id: F, version_sha: pin2, role: "load_bearing" }],
    completeness: { statement: STMT2, author: "olive" }, sig: SIG(2), at: T2 }).ok, true);
  const text2 = w.text(F);
  const e2 = w.signFinding(F, { title: "Finding F", sig: SIG(12), at: T2, edges: publishedGraphEdges(w.fm(F)),
    shas: [{ sha256: pin2, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text2) }] });
  assert.deepEqual([e2.ok, e2.edition, e2.case.complete], [true, 2, true], "fixture: edition 2 published and complete");
  env.PUBLISHED.m.set(pubKey(pin2), new TextEncoder().encode(text2));
  const c2 = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", via: "test",
                                           cs: w.p.caseEditionState(CASE, 2, "test-group") });
  const m2 = c2.manifest_sha;
  assert.notEqual(m2, m1, "each edition has its own container");

  const latest = w.read("publishedcase", { id: CASE });
  assert.deepEqual([latest.edition, latest.findings[0].bundle_sha, latest.editions, latest.latest_edition],
                   [2, pin2, [1, 2], 2], "the case alone answers the latest edition and names every edition");
  assert.deepEqual(w.read("publishedcase", { id: F }).edition, 2, "and so does the finding's id alone");
  const byHash1 = w.read("publishedcase", { sha256: pin1 });
  const byHash2 = w.read("publishedcase", { sha256: pin2 });
  assert.deepEqual([byHash1.edition, byHash1.asked, byHash1.findings[0].bundle_sha, byHash1.findings[0].edition,
                    byHash1.completeness.statement, byHash1.manifest_sha],
                   [1, F, pin1, 1, STMT1, m1], "A HASH RESOLVES TO ITS OWN EDITION, never the current one (DEC-12)");
  assert.deepEqual([byHash2.edition, byHash2.findings[0].bundle_sha, byHash2.findings[0].edition,
                    byHash2.completeness.statement, byHash2.manifest_sha], [2, pin2, 2, STMT2, m2]);
  assert.equal(w.read("publishedcase", { id: CASE, edition: 1 }).completeness.statement, STMT1,
               "edition 1 by number still says what it said");
  assert.deepEqual([byHash1.findings[0].sig_armored, byHash2.findings[0].sig_armored], [SIG(11), SIG(12)],
                   "each edition keeps its own signature");
  assert.deepEqual([byHash1.ratified_at, byHash2.ratified_at], [T1, T2]);
  assert.deepEqual([byHash1.document.sig_armored, byHash2.document.sig_armored], [SIG(1), SIG(2)]);
  assert.deepEqual(byHash1.edition_index, [{ edition: 1, ratified_at: T1, manifest_sha: m1, withdrawn: null },
                                           { edition: 2, ratified_at: T2, manifest_sha: m2, withdrawn: null }]);
  /* Through the Worker: the hash (any case) resolves the same way, and edition 1's body is edition 1's bytes. */
  const w1 = await anonCase(w, env, { sha256: pin1.toUpperCase() });
  assert.deepEqual([w1.edition, w1.findings[0].body.from_sha], [1, pin1]);
  assert.doesNotMatch(w1.findings[0].body.question, /comparison memo/, "edition 1's body, not the current document's");
  assert.match((await anonCase(w, env, { sha256: pin2 })).findings[0].body.question, /comparison memo/);
  assert.equal((await call(w, env, "publishedbytes", { sha256: pin1 })).status, 200, "edition 1's bytes still stream");
  assert.equal((await call(w, env, "publishedbytes", { sha256: m1, format: "zip" })).status, 200,
               "and edition 1's container still assembles");
  assert.equal(w.read("verify", { sha256: pin1 }).published, true, "and edition 1 still verifies (R1)");
});

test("R3 (block 6) a division disclosure: a finding names its parent and siblings, and serves neither", async () => {
  const { w, env, proj } = await publishedWorld();
  const KID = "INQ-2026-2200-authority", PARENT = "INQ-2026-2200-mixed", SIB = "INQ-2026-2200-signature";
  w.inquiry(PARENT);
  w.inquiry(SIB);
  w.inquiry(KID, { legs: [{ target: DOC_CONN }] });
  const pin = w.head(KID);
  const KCASE = "CASE-2026-2201";
  w.prepare(KCASE, 1, { format: "bio-case-document/5", project: proj, roles: [{ target: KID, version_sha: pin, role: "load_bearing" }] });
  assert.equal(w.signCase(KCASE, 1, { project: proj, roster: [{ bundle_id: KID, version_sha: pin, role: "load_bearing" }] }).ok, true);
  /* The graph ratification hands the commit, classified from the ratified bytes: references[] is serve-class, a
     division's parent and siblings are name-only BY KIND. */
  const edges = publishedGraphEdges({ ...w.fm(KID), division_parent: PARENT, division_siblings: [SIB] });
  assert.deepEqual(edges.filter((e) => e.disclosure === "name").map((e) => [e.to, e.kind]),
                   [[PARENT, "division_parent"], [SIB, "division_sibling"]], "fixture: the classification");
  assert.equal(w.signFinding(KID, { edges }).ok, true);
  env.PUBLISHED.m.set(pubKey(pin), new TextEncoder().encode(w.text(KID)));
  for (const c of [w.read("publishedcase", { id: KID }), await anonCase(w, env, { id: KID })]) {
    const kid = c.findings[0];
    assert.deepEqual([kid.division.parent, kid.division.siblings], [PARENT, [SIB]], "names its parent and every sibling");
    assert.match(kid.division.detail, /the other half exists/, "and says why it is a name and not a door");
    assert.deepEqual(kid.serves.filter((e) => e.to === PARENT || e.to === SIB), [], "serves neither");
    assert.deepEqual(kid.serves.map((e) => e.to), [DOC_CONN]);
    assert.ok(kid.serves.every((e) => Number.isInteger(e.edition)), "every served edge names a published edition");
    assert.deepEqual(kid.names, [{ to: PARENT, kind: "division_parent" }, { to: SIB, kind: "division_sibling" }],
                     "a name-only edge carries an id and a kind and nothing else: no title, no state, no sha");
    assert.deepEqual(kid.unresolved, [], "no edge classified servable with nothing published behind it");
  }
  assert.deepEqual(w.read("publishedcase", { id: CASE }).findings.flatMap((x) => x.unresolved), []);
  /* Naming them bought the caller nothing. */
  const never = JSON.stringify(w.read("publishedcase", { id: "INQ-2026-9999-nothing" }));
  assert.equal(JSON.stringify(w.read("publishedcase", { id: PARENT })), never);
  assert.equal(JSON.stringify(w.read("publishedcase", { id: SIB })), never);
  for (const id of [PARENT, SIB]) {
    const r = await call(w, env, "publishedbytes", { sha256: w.head(id) });
    assert.deepEqual([r.status, (await r.json()).reason], [404, "NO_PUBLISHED_PART"], `${id}'s bytes are not reachable`);
  }
});

test("R3 (block 8, M0-11) the loose branch: ratified bytes in no case answer, with their full contract", async () => {
  const { w, env } = await publishedWorld();
  const LOOSE = DOC_CONN, LOOSE_SHA = w.head(DOC_CONN);
  const caseAns = await anonCase(w, env, { id: F });
  for (const [label, c] of [["op", w.read("publishedcase", { id: LOOSE })], ["worker", await anonCase(w, env, { id: LOOSE })]]) {
    const f0 = c.findings[0];
    assert.deepEqual([c.ok, c.caseId, c.edition, c.findings.length, f0.bundle_id], [true, null, 1, 1, LOOSE], `${label}: it answers`);
    assert.deepEqual([c.caseId, c.scope, c.completeness, c.bias_acknowledgement, c.document, c.project, c.bar],
                     [null, null, null, null, null, null, null], `${label}: no case identity, scope, completeness, bias, document, project or bar`);
    assert.ok(["caseId", "scope", "completeness", "bias_acknowledgement", "document", "project", "bar"].every((k) => k in c),
              `${label}: stated null, never omitted`);
    assert.match(c.bar_detail, /NO BAR IS RECORDED/);
    assert.deepEqual([c.manifest_sha, c.manifest, c.files], [null, null, []], `${label}: no container`);
    assert.deepEqual([c.complete, c.awaiting], [true, []], `${label}: complete says nothing is awaited, and completeness stays null`);
    assert.equal("strength" in c, false);
    assert.equal("asked" in c, false, `${label}: the id IS the answer`);
    assert.equal("detail" in c, false, `${label}: the loose state's own sentence is not on the one success return`);
    assert.deepEqual([f0.version_sha, f0.role, f0.edition, f0.strength, f0.required, f0.sig_armored, f0.bundle_sha],
                     [null, null, 1, null, null, SIG(21), LOOSE_SHA], `${label}: nothing pinned it, and it derives no pair`);
    assert.deepEqual([f0.attestor, f0.delivered_by], [{ member: "olive", key_b64: KEY }, { kind: "member", member: "olive" }]);
    assert.deepEqual([f0.serves, f0.names, f0.unresolved, f0.tensions], [[], [], [], null]);
    assert.deepEqual([c.tensions, c.highlighted, c.tensions_unread, c.captures, c.sources], [null, null, null, null, null]);
    assert.match(c.tensions_detail, /this is not a case/);
    assert.match(c.blocks_detail, /this is not a case/);
    assert.deepEqual(c.edition_index.map((e) => Object.keys(e).sort()), [["edition", "ratified_at"]],
                     `${label}: a loose edition row has no manifest_sha key`);
    assert.deepEqual([c.editions, c.latest_edition, c.edition_index[0].ratified_at], [[1], 1, T0]);
    assert.deepEqual(c.evidence_package.blocks, {});
  }
  const c = await anonCase(w, env, { id: LOOSE });
  const f0 = c.findings[0];
  const keysOf = (o) => Object.keys(o).filter((k) => k !== "asked").sort();
  assert.deepEqual(keysOf(c), keysOf(caseAns), "the two branches answer one key set: one success return");
  assert.ok(keysOf(c).length >= 18, "and the key set is not empty");
  assert.deepEqual(Object.keys(caseAns.edition_index[0]).sort(), ["edition", "manifest_sha", "ratified_at", "withdrawn"],
                   "a case edition's row carries its withdrawal stamp or null (R20)");
  assert.deepEqual([c.withdrawn, c.docket_last_entry], [null, null], "a loose bundle is not a case and has no docket (R20)");
  assert.deepEqual([c.case_detail === caseAns.case_detail, c.graph_detail === caseAns.graph_detail], [true, true]);
  assert.match(c.graph_detail, /serves\[\] is what this surface may hand over/);
  assert.deepEqual([c.verification.container, c.verification.manifest], [null, null]);
  assert.deepEqual([f0.object_type, f0.body.state, f0.body.from_sha], ["information", "published", LOOSE_SHA],
                   "the body from the bundle's own published bytes");
  assert.deepEqual([f0.body.question, f0.body.conclusion, f0.body.authored.conclusion, f0.basis], [null, null, null, []],
                   "an information document has no inquiry sections: null, not empty");
  /* `asked` is conditional alike on both branches. */
  const byHash = w.read("publishedcase", { sha256: LOOSE_SHA });
  assert.deepEqual([byHash.ok, byHash.caseId, byHash.asked, byHash.edition], [true, null, LOOSE, 1]);
  assert.equal(w.read("publishedcase", { id: LOOSE, edition: 1 }).findings[0].bundle_id, LOOSE);
  const r = await call(w, env, "publishedbytes", { sha256: LOOSE_SHA });
  assert.deepEqual([r.status, sha(Buffer.from(await bytesOf(r)))], [200, LOOSE_SHA], "the bytes stream by hash");
  /* The negative direction. */
  assert.equal(caseAns.caseId, CASE, "bytes in a case never take this branch");
  assert.notEqual(caseAns.manifest_sha, null);
  const NEVER = "INFO-2026-2200-never-ratified";
  w.doc(NEVER);
  const nr = w.read("publishedcase", { id: NEVER });
  assert.deepEqual([nr.ok, nr.reason], [false, "NOT_PUBLISHED"], "belonging to no case is not what opens this door");
  assert.equal(JSON.stringify(nr), JSON.stringify(w.read("publishedcase", { id: "INFO-2026-9999-nothing" })));
  assert.equal(JSON.stringify(w.read("publishedcase", { sha256: w.head(NEVER) })),
               JSON.stringify(w.read("publishedcase", { sha256: sha("never existed") })));
  assert.equal(w.read("publishedcase", { id: LOOSE, edition: 7 }).reason, "NOT_PUBLISHED");
});

test("R5 (block 3) published bytes stream by hash with their headers; a planted object is NO_PUBLISHED_PART, as a never-existed hash", async () => {
  const { w, env, pin, text } = await publishedWorld();
  const r = await call(w, env, "publishedbytes", { sha256: pin });
  const got = await bytesOf(r);
  assert.deepEqual([r.status, sha(Buffer.from(got)), new TextDecoder().decode(got)], [200, pin, text]);
  assert.deepEqual(
    ["content-type", "access-control-allow-origin", "x-published-sha256", "x-published-kind", "content-disposition"]
      .map((h) => r.headers.get(h)),
    ["application/octet-stream", "*", pin, "bundle", 'attachment; filename="bundle.md"'],
    "the part it served is named, and a filename offered (the path disclosed on the way out only)");
  const cap = await call(w, env, "publishedbytes", { sha256: CAP_SHA });
  assert.deepEqual([cap.status, sha(Buffer.from(await bytesOf(cap))), cap.headers.get("x-published-kind"),
                    cap.headers.get("content-disposition")],
                   [200, CAP_SHA, "capture", 'attachment; filename="memo.bin"'], "a captured part streams too");
  const up = await call(w, env, "publishedbytes", { sha256: pin.toUpperCase() });
  assert.deepEqual([up.status, up.headers.get("x-published-sha256")], [200, pin], "the hash is read lowercased");
  /* A working bundle and a hash that never existed: one answer. */
  w.inquiry("INQ-2026-2200-working");
  const WORKING = w.head("INQ-2026-2200-working");
  const never = sha("a document this instance has never seen");
  const [a, b] = [await call(w, env, "publishedbytes", { sha256: WORKING }), await call(w, env, "publishedbytes", { sha256: never })];
  const [aj, bj] = [await a.json(), await b.json()];
  assert.deepEqual([a.status, aj.reason, aj.check, aj.translation], [404, "NO_PUBLISHED_PART", "C-98.1", rowOf("NO_PUBLISHED_PART").translation]);
  assert.deepEqual([b.status, { ...bj, sha256: "X" }], [404, { ...aj, sha256: "X" }], "identical, status and body, sha aside");
  assert.match((await (await call(w, env, "publishedbytes", { sha256: "nonsense" })).json()).error, /never by path/);
  assert.match((await (await call(w, env, "publishedbytes", { path: "bundle.md", id: F })).json()).error, /requires sha256=/,
               "there is no path parameter to try");
  /* THE ADVERSARY: the working bundle's own bytes planted in the PUBLISHED bucket at its published key. The bucket
     holds them; nothing published names the sha; the table is the authority. */
  env.PUBLISHED.m.set(pubKey(WORKING), new TextEncoder().encode(w.text("INQ-2026-2200-working")));
  const planted = await call(w, env, "publishedbytes", { sha256: WORKING });
  const raw = await bytesOf(planted);
  let body = null;
  try { body = JSON.parse(new TextDecoder().decode(raw)); } catch { body = null; }
  assert.notEqual(body, null, `the planted object must not stream (served sha ${body ? "" : sha(Buffer.from(raw))})`);
  assert.deepEqual([planted.status, body.reason, body.check], [404, "NO_PUBLISHED_PART", "C-98.1"]);
  assert.match(body.detail, /never existed are the same answer/);
  assert.deepEqual({ ...body, sha256: "X" }, { ...bj, sha256: "X" }, "planted answers exactly as never-existed");
  assert.equal(w.read("verify", { sha256: WORKING }).published, false);
  assert.equal(planted.headers.get("x-published-kind"), null, "and no part header is sent");
});

test("R6, R5 (block 4) the container: a zip served by the manifest's hash with its headers, MANIFEST.json byte-identical to the stored manifest, deterministic", async () => {
  const { w, env, pin, manifestSha } = await publishedWorld();
  const m = await call(w, env, "publishedbytes", { sha256: manifestSha });
  const mRaw = await bytesOf(m);
  const manifest = JSON.parse(new TextDecoder().decode(mRaw));
  assert.deepEqual([m.status, m.headers.get("x-published-kind"), m.headers.get("content-disposition"), sha(Buffer.from(mRaw))],
                   [200, "manifest", 'attachment; filename="MANIFEST.json"', manifestSha], "the manifest answers by its own hash");
  const stored = w.read("publishedcase", { id: CASE }).manifest;
  assert.deepEqual(manifest, stored, "the served manifest is the stored manifest");
  assert.deepEqual(mRaw, new TextEncoder().encode(JSON.stringify(stored, null, 1)), "byte for byte, in its canonical form");
  assert.deepEqual([manifest.format, manifest.case, manifest.edition, "strength" in manifest],
                   ["bio-case-container/6", CASE, 1, false]);
  assert.deepEqual(manifest.findings.map((x) => [x.bundle_id, x.signature.armored, x.strength.length]), [[F, SIG(11), 2]]);

  const z = await call(w, env, "publishedbytes", { sha256: manifestSha, format: "zip" });
  const zip = await bytesOf(z);
  assert.equal(z.status, 200);
  assert.deepEqual(
    ["content-type", "access-control-allow-origin", "x-manifest-sha256", "x-container-sha256", "x-container-parts",
     "content-disposition"].map((h) => z.headers.get(h)),
    ["application/zip", "*", manifestSha, sha(Buffer.from(zip)), String(manifest.parts.length + 1),
     `attachment; filename="${CASE}-edition-1.zip"`], "the container's own hash travels with it");
  const zc = await readContainer(zip);
  assert.equal(zc.ok, true, "a real central directory, read by the plane's own reader");
  const names = zc.entries.map((e) => e.name);
  assert.deepEqual([names[0], names.slice(1).sort()],
                   ["MANIFEST.json", manifest.parts.map((p) => `${CASE}/${p.path}`).sort()], "manifest at the root, each part at its path");
  assert.ok(zc.entries.every((e) => e.method === 0), "stored, never deflated");
  for (const p of manifest.parts) {
    const got = await readPart(zip, zc, `${CASE}/${p.path}`);
    assert.equal(got.ok && sha(Buffer.from(got.bytes)), p.sha256, `${p.path} hashes to what the manifest says, CRC-checked`);
  }
  const mp = await readPart(zip, zc, "MANIFEST.json");
  assert.deepEqual(mp.bytes, env.PUBLISHED.m.get(pubKey(manifestSha)), "MANIFEST.json in the zip is byte-identical to the stored bytes");
  assert.equal(sha(Buffer.from(mp.bytes)), manifestSha, "and hashes to the manifest's hash");
  const z2 = await bytesOf(await call(w, env, "publishedbytes", { sha256: manifestSha, format: "zip" }));
  assert.deepEqual(z2, zip, "served by hash, so twice means the same bytes");
  const notc = await call(w, env, "publishedbytes", { sha256: pin, format: "zip" });
  assert.deepEqual([notc.status, (await notc.json()).reason], [400, "NOT_A_CONTAINER"], "a part asked as a container is refused by name");
  assert.match(manifest.verify, /tamper-EVIDENT/);
  assert.match(manifest.verify, /nothing here prevents/);
  assert.match(manifest.layout.note, /Renderings \(REC-22\) join parts\[\] as kind: rendering/);
});

test("R5 (D-561) CONTAINER_TOO_LARGE answers 413 through the op, with C-98.7's row; the genuine container serialises again after", async () => {
  const { w, env, manifestSha } = await publishedWorld();
  const zipBefore = await bytesOf(await call(w, env, "publishedbytes", { sha256: manifestSha, format: "zip" }));
  const mKey = pubKey(manifestSha);
  const mBytes = env.PUBLISHED.m.get(mKey);
  const manifest = JSON.parse(new TextDecoder().decode(mBytes));
  /* Over the 64 MiB bound with 33 MiB stored: one published object, named twice at two paths. Only the bucket's
     bytes are tampered; the record's rows are untouched. */
  assert.equal(CONTAINER_MAX_BYTES, 64 * 1024 * 1024);
  const bigSha = sha("D-561 one large part");
  env.PUBLISHED.m.set(pubKey(bigSha), new Uint8Array(33 * 1024 * 1024));
  env.PUBLISHED.m.set(mKey, new TextEncoder().encode(JSON.stringify({ ...manifest,
    parts: [...manifest.parts, { path: "d561/big-a.bin", sha256: bigSha }, { path: "d561/big-b.bin", sha256: bigSha }] })));
  const r = await call(w, env, "publishedbytes", { sha256: manifestSha, format: "zip" });
  const body = await r.json();
  const row = rowOf("CONTAINER_TOO_LARGE");
  assert.deepEqual([r.status, body.ok, body.reason, body.code, body.check, body.translation],
                   [413, false, "CONTAINER_TOO_LARGE", "CONTAINER_TOO_LARGE", "C-98.7", row.translation]);
  assert.ok(typeof body.translation === "string" && body.translation.length > 60, "a real sentence, not an empty row");
  env.PUBLISHED.m.delete(pubKey(bigSha));
  env.PUBLISHED.m.set(mKey, mBytes);
  const z = await call(w, env, "publishedbytes", { sha256: manifestSha, format: "zip" });
  assert.deepEqual([z.status, z.headers.get("content-type")], [200, "application/zip"]);
  assert.deepEqual(await bytesOf(z), zipBefore, "byte-identical to before the arm");
});
