/* ratification R5: the finding commit (`publish`, the store half of `op=ratify`) — what may cross, and under whose
   authority — and what it hands publication's `commitEdition` (R22); R7: the gate facts, and one answer for a bundle the
   viewer cannot see and one never minted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, NOW } from "./fixture.mjs";
import { RATIFY_SCOPE_CHECKS } from "../../../src/ratification/index.mjs";

const Q = "INQ-2026-0001-finding", DOC = "INFO-2026-0001-evidence";
const SIG = "-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----\n";

/* alice owns P; carol owns P2; bo joined P; eve is in no project. */
function setup() {
  const w = world();
  for (const m of ["alice", "bo", "carol", "eve"]) w.member(m);
  const P = w.project("Team", "alice", { joined: ["bo"] });
  const P2 = w.project("Other", "carol");
  w.inquiry(Q); w.info(DOC);
  const args = (id, o = {}) => ({ bundleId: id, bundleSha: w.sha(id), attestorKey: "KEY", attestorMember: "alice",
                                  gateVersion: "plane-gate/1.0", sigArmored: SIG, shas: [{ sha256: w.sha(id), path: "bundle.md", kind: "bundle", bytes: 10 }],
                                  title: "t", completeness: null, strength: null, edges: [], group: "test-group",
                                  deliveredBy: V("alice"), ...o });
  const caseOf = (caseId, project) =>
    w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?, ?, ?)`, caseId, project, NOW);
  return { w, P, P2, args, caseOf, publish: (id, o) => w.r.publish(args(id, o)) };
}
const edits = (w) => w.count("published_bundles");

test("R5: MALFORMED without the bundle, its sha, the key, the gate version, the signature or the hash list", () => {
  const { w, publish } = setup();
  for (const k of ["bundleId", "bundleSha", "attestorKey", "gateVersion", "sigArmored"])
    assert.equal(publish(Q, { [k]: null }).reason, "MALFORMED", k);
  assert.equal(publish(Q, { shas: "x" }).reason, "MALFORMED");
  assert.equal(edits(w), 0);
});

test("R5: a finding at a sha no ratified case pins is C-58.2; anything else no ratified case's finding rests on is C-58.3; nothing is written", () => {
  const { w, publish } = setup();
  const a = publish(Q);
  assert.deepEqual([a.reason, a.code, a.check, a.translation],
    ["RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE", "RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE", "C-58.2",
     RATIFY_SCOPE_CHECKS.RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE.translation]);
  assert.match(a.detail, /op=caseratify\) FIRST/);
  const b = publish(DOC);
  assert.deepEqual([b.reason, b.check], ["RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE", "C-58.3"]);
  assert.equal(edits(w), 0);
});

test("R5: a finding a ratified case pins needs caseAuthority for the pinning project: its owner signs, a joined member or the founder delivers", () => {
  const { w, P, publish, caseOf } = setup();
  caseOf("CASE-2026-0001", P);
  w.pub.pins.set(`${Q}@${w.sha(Q)}`, [{ case_id: "CASE-2026-0001", edition: 1, role: "load_bearing" }]);
  assert.equal(publish(Q, { attestorMember: "bo", deliveredBy: V("bo") }).reason, "CASE_SIGNER_NOT_AN_OWNER");
  assert.equal(publish(Q, { deliveredBy: V("eve") }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(publish(Q, { attestorMember: "carol" }).reason, "CASE_SIGNER_NOT_AN_OWNER");
  assert.equal(edits(w), 0);
  for (const deliveredBy of [V("bo"), "founder", V("alice")]) assert.equal(publish(Q, { deliveredBy }).ok, true, deliveredBy);
});

test("R5: pinned by several projects' cases, some project passing both questions publishes; otherwise the first project's refusal, in id order", () => {
  const { w, P, P2, publish, caseOf } = setup();
  caseOf("CASE-2026-0001", P); caseOf("CASE-2026-0002", P2);
  w.pub.pins.set(`${Q}@${w.sha(Q)}`, [{ case_id: "CASE-2026-0002", edition: 1 }, { case_id: "CASE-2026-0001", edition: 3 }]);
  assert.equal(publish(Q, { attestorMember: "carol", deliveredBy: "founder" }).ok, true, "P2's owner");
  assert.equal(publish(Q, { deliveredBy: "founder" }).ok, true, "P's owner");
  const refused = publish(Q, { attestorMember: "eve", deliveredBy: "founder" });
  assert.deepEqual([refused.reason, refused.project], ["CASE_SIGNER_NOT_AN_OWNER", [P, P2].sort()[0]]);
  assert.match(refused.detail, /a member of case CASE-2026-000\d edition \d/);
});

test("R5: anything else crosses only as the evidence a ratified case's pinned finding rests on, under that project's authority", () => {
  const { w, P, P2, publish } = setup();
  w.pub.resting.set(DOC, [{ case_id: "CASE-2026-0001", finding: Q, project: P }]);
  assert.equal(publish(DOC, { attestorMember: "carol" }).reason, "CASE_SIGNER_NOT_AN_OWNER");
  assert.equal(publish(DOC, { deliveredBy: V("eve") }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(publish(DOC).ok, true);
  w.pub.resting.set(DOC, [{ case_id: "CASE-2026-0002", finding: Q, project: P2 }, { case_id: "CASE-2026-0001", finding: Q, project: P }]);
  assert.equal(publish(DOC, { attestorMember: "carol", deliveredBy: "founder" }).ok, true, "an owner of ANY resting project");
  const inq = setup();
  inq.w.pub.resting.set(Q, [{ case_id: "CASE-2026-0001", finding: "INQ-2026-0009-x", project: inq.P }]);
  assert.equal(inq.publish(Q).ok, true, "an inquiry a pinned finding rests on crosses as evidence");
});

/* N308: publication R38 answers a page of at most 1,000 pins with a cursor; the scope arm reads from the start through
   each cursor to null, and no further once a resting finding's project admits the act. */
const restingReads = (w) => w.calls.filter((c) => c[0] === "ratifiedFindingsRestingOn").map((c) => c[2]?.after ?? null);
const spread = (n, at) => Array.from({ length: n }, (_, i) => at[i] ?? null);

test("R5: over more pins than one page holds, the scope arm reads every page through each cursor to null", () => {
  const { w, P, P2, publish } = setup();
  /* 2,500 pins: P2's finding on the first page (alice is no owner of P2), P's on the third (alice owns P) */
  w.pub.resting.set(DOC, spread(2500, { 10: { case_id: "CASE-2026-0002", finding: "INQ-2026-0002-b", project: P2 },
                                         2400: { case_id: "CASE-2026-0001", finding: Q, project: P } }));
  assert.equal(publish(DOC).ok, true, "admitted by the project whose finding rests on the bundle on the last page");
  const reads = restingReads(w);
  assert.equal(reads.length, 3);
  assert.equal(reads[0], null, "from the start");
  assert.ok(reads[1] && reads[2] && reads[1] !== reads[2], "then through each cursor the previous page answered");
  /* every pin read and none resting: C-58.3 for evidence, C-58.2 for a finding, as with no pin at all */
  const none = setup();
  none.w.pub.resting.set(DOC, spread(2001, {}));
  none.w.pub.resting.set(Q, spread(1001, {}));
  assert.equal(none.publish(DOC).check, "C-58.3");
  assert.equal(none.publish(Q).check, "C-58.2");
  assert.deepEqual(restingReads(none.w).length, 5, "three pages for the evidence, two for the finding");
  assert.equal(edits(none.w), 0);
});

test("R5: the scope arm reads no further once a resting finding's project admits the act", () => {
  const { w, P, P2, publish } = setup();
  const list = spread(2500, { 5: { case_id: "CASE-2026-0001", finding: Q, project: P },
                              1500: { case_id: "CASE-2026-0002", finding: "INQ-2026-0002-b", project: P2 } });
  w.pub.resting.set(DOC, list);
  assert.equal(publish(DOC).ok, true, "alice owns P, whose finding rests on the bundle on the first page");
  assert.deepEqual(restingReads(w), [null], "one page read");
  const other = setup();
  other.w.pub.resting.set(DOC, list.map((f) => f && { ...f, project: f.project === P ? other.P : other.P2 }));
  assert.equal(other.publish(DOC, { attestorMember: "carol", deliveredBy: "founder" }).ok, true, "carol owns P2");
  assert.equal(restingReads(other.w).length, 2, "P refused on the first page, P2 admitted on the second, no third read");
});

test("R5: with no resting project admitting, the refusal is the one the whole list gave: the first project in id order, naming its every finding", () => {
  const paged = setup();
  const f = [{ case_id: "CASE-2026-0002", finding: "INQ-2026-0002-b", project: paged.P2 },
             { case_id: "CASE-2026-0001", finding: Q, project: paged.P },
             { case_id: "CASE-2026-0003", finding: "INQ-2026-0003-c", project: paged.P },
             { case_id: "CASE-2026-0004", finding: "INQ-2026-0004-d", project: paged.P2 }];
  const eve = { attestorMember: "eve", deliveredBy: "founder" };
  paged.w.pub.resting.set(DOC, f);
  const b = paged.publish(DOC, eve);
  paged.w.calls.length = 0;
  paged.w.pub.resting.set(DOC, spread(3000, { 3: f[0], 1200: f[1], 2300: f[2], 2999: f[3] }));
  const a = paged.publish(DOC, eve);
  assert.equal(a.reason, "CASE_SIGNER_NOT_AN_OWNER");
  assert.equal(a.project, [paged.P, paged.P2].sort()[0]);
  for (const x of f.filter((y) => y.project === a.project))
    assert.ok(a.detail.includes(`${x.finding} of case ${x.case_id}`), x.finding);
  assert.deepEqual(a, b, "the same refusal as one page answering every finding");
  assert.equal(restingReads(paged.w).length, 3);
  assert.equal(edits(paged.w), 0);
});

test("R5, R12: the commit hands publication the signed edition, the pins, the signer and the deliverer each from its own source; a retry is idempotent", () => {
  const { w, P, publish, caseOf } = setup();
  caseOf("CASE-2026-0001", P);
  const pins = [{ case_id: "CASE-2026-0001", edition: 1, role: "load_bearing" }];
  w.pub.pins.set(`${Q}@${w.sha(Q)}`, pins);
  const edges = [{ to: DOC, kind: "reference", disclosure: "serve" }];
  const r = publish(Q, { edition: 2, edges, memberCarriesBlocks: true, strength: [{ axis: "capture" }], deliveredBy: V("bo") });
  assert.deepEqual([r.ok, r.existed, r.edition], [true, false, 2]);
  const [, a] = w.calls.find((c) => c[0] === "commitEdition");
  assert.deepEqual([a.bundleId, a.bundleSha, a.edition, a.edges, a.memberCarriesBlocks, a.group, a.strength],
    [Q, w.sha(Q), 2, edges, true, "test-group", [{ axis: "capture" }]]);
  assert.deepEqual(w.row(`SELECT edition, bundle_sha, attestor_member, delivered_by, gate_version FROM published_bundles WHERE bundle_id=?`, Q),
    { edition: 2, bundle_sha: w.sha(Q), attestor_member: "alice", delivered_by: V("bo"), gate_version: "plane-gate/1.0" });
  assert.deepEqual([a.attestorKey, a.attestorMember, a.deliveredBy, a.gateVersion, a.sigArmored],
    ["KEY", "alice", V("bo"), "plane-gate/1.0", SIG]);
  assert.match(a.at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
  const again = publish(Q, { deliveredBy: null });
  assert.deepEqual([again.existed, again.edition], [true, 2], "a retry of the same bytes answers the edition they carry");
  const [, b] = w.calls.filter((c) => c[0] === "commitEdition")[1];
  assert.equal(b.deliveredBy, null, "never defaulted to the signer");
  assert.equal("edition" in b, false, "an edition the bytes did not name is left to publication");
  assert.equal(w.count("published_bundles"), 1, "nothing new was written");
  assert.equal(w.row(`SELECT delivered_by FROM published_bundles WHERE bundle_id=?`, Q).delivered_by, V("bo"), "the first delivery stands");
});

/* ---- R7 ---- */

test("R7: gateFacts answers the head, the lists older readers read, the register, the testimony and attribution facts, the signers and the three registries", async () => {
  const { w } = setup();
  const { newKey } = await import("./fixture.mjs");
  const k = await newKey();
  w.st.sql.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES (?, 'alice', 'active', 't')`, k.keyB64);
  w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id) VALUES (?, 0, ?)`, Q, DOC);
  w.st.sql.exec(`INSERT INTO refs (bundle_id, target_id) VALUES (?, ?), (?, ?)`, Q, DOC, Q, "INFO-2026-0404-gone");
  w.registers.set(Q, [{ capture_sha: "c".repeat(64), path: "snapshots/a.pdf", bytes: 10, authored: 0 }]);
  w.bv.reach = { self: [], via: [{ finding: Q, observation: "INFO-2026-0002-obs" }] };
  w.publication.observationsNamingAuthor = (ids) => ids.map((x) => `legacy:${x}`);
  w.pub.claims.set(Q, ["CASE-2026-0001"]);
  const f = w.r.gateFacts(Q, V("eve"));
  assert.equal(f.ok, true);
  assert.deepEqual(f.row, { bundle_id: Q, object_type: "inquiry", current_state: "open", bundle_sha: w.sha(Q) });
  assert.deepEqual(f.manifest.map((m) => m.kind), [w.row(`SELECT kind FROM manifest WHERE bundle_id=?`, Q).kind]);
  assert.deepEqual(f.history, w.st.sql.exec(`SELECT snap_key, sha256 FROM history WHERE bundle_id=? AND path='bundle.md'`, Q));
  assert.deepEqual(f.registers, [{ capture_sha: "c".repeat(64), path: "snapshots/a.pdf", bytes: 10 }]);
  assert.deepEqual([f.testimony, f.testimonyLegacy, f.attributionStated], [w.bv.reach, ["legacy:INFO-2026-0002-obs"], false]);
  assert.deepEqual(f.dangling, ["INFO-2026-0404-gone"]);
  assert.deepEqual(f.signers, [{ key_b64: k.keyB64, member_id: "alice" }]);
  assert.deepEqual(f.publishedRegistry, { asked: [Q, DOC] });
  assert.deepEqual(f.publishedCaseRegistry, { cases: ["CASE-2026-0001"] });
  assert.deepEqual(f.earnedRegistry, { subject: `ENT-of-${Q}`, earned: { capture: { [DOC]: null } } });
});

test("R7: a bundle the viewer cannot see answers byte-identically to one never minted; an unsent viewer is not asked", () => {
  const { w, P } = setup();
  const seen = w.r.gateFacts(P, V("alice"));
  assert.equal(seen.ok, true);
  const hidden = w.r.gateFacts(P, V("eve"));
  const absent = w.r.gateFacts("PROJ-2026-0404-none", V("eve"));
  assert.deepEqual(hidden, { ok: false, reason: "ABSENT", bundleId: P });
  assert.equal(JSON.stringify(hidden).replace(P, "X"), JSON.stringify(absent).replace("PROJ-2026-0404-none", "X"));
  assert.equal(w.r.gateFacts(P, null).ok, true, "a tool, not a caller");
  assert.deepEqual(w.r.gateFacts("", V("eve")), { ok: false, reason: "ABSENT", bundleId: "" });
  assert.deepEqual(w.op("gatefacts", { id: P, viewer: V("eve") }), hidden, "the op reads the viewer the control plane stamped");
});

test("R7: a project whose existence alone the viewer may see answers membership's existence act (C-70.1)", () => {
  const { w, P } = setup();
  assert.equal(w.membership.projectVisibilitySet({ projectId: P, setting: "discoverable", by: "alice", viewer: V("alice") }).ok, true);
  const f = w.r.gateFacts(P, V("eve"));
  assert.deepEqual([f.ok, f.reason, f.check, f.project], [false, "PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", P]);
  assert.equal(w.r.gateFacts(P, V("alice")).ok, true);
});
