/* ratification R2: `op=caseratify` at the control plane (`caseRatifyOp`, the Worker half), in its order of refusals —
   each driven by relaxing the ones before it — then the commit through the store half (R3) and the container when the
   case is complete at this act (R6). The signature is a real SSHSIG over `caseRatifyStatement`; the gate is this
   module's catalogue on the promotion instance (K233). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signCase, cleanCase, fmText, CASE_BODY, V, SILENT } from "./fixture.mjs";
import { caseRatifyOp, ratificationOp } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines, RATIFY_MACHINE_FENCE_CHECKS as FENCE, RATIFY_TESTIMONY_CHECKS as TESTIMONY,
         RATIFY_ATTRIBUTION_CHECKS as ATTRIBUTION } from "../../../src/ratification/index.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };

async function setup({ mutate = (d) => d } = {}) {
  const w = world();
  const key = await newKey(), other = await newKey();
  w.member("alice", { signer: key }); w.member("bo");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = mutate(cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] }));
  const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  const facts = { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                  attribution: { reached: [], legacy: [], stated: [], current: [] },
                  signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null };
  w.pub.facts.set(`${CASE}#1`, facts);
  const sig = await signCase(key, CASE, 1, docSha);
  const run = async (body = { caseId: CASE, edition: 1, expectedSha: docSha, sig }, o = {}) => {
    const p = plane(w, o);
    const res = await caseRatifyOp(p.request(body), p.stub, p.ctx);
    return { ...res, p };
  };
  return { w, P, key, other, docSha, sig, facts, run };
}

test("R2: a machine credential is refused C-32.13 before the payload is read; any caller not arriving through a member's session C-32.15", async () => {
  const { run } = await setup();
  const m = await run("not json", { aiCred: { tokenId: "t1" }, cls: "ai" });
  assert.deepEqual([m.status, m.body.reason, m.body.check, m.body.translation, m.body.tokenClass],
    [403, "MACHINE_CANNOT_RATIFY_CASE", "C-32.13", FENCE.MACHINE_CANNOT_RATIFY_CASE.translation, "ai"]);
  for (const cls of ["admin", "member", "probe"]) {
    const o = await run("not json", { viaSession: false, cls });
    assert.deepEqual([o.status, o.body.reason, o.body.check, o.body.tokenClass], [403, "OPERATOR_TOKEN_CANNOT_RATIFY_CASE", "C-32.15", cls]);
    assert.deepEqual(o.p.fetched, [], "nothing is read");
  }
});

test("R2: MALFORMED without caseId, an integer edition, expectedSha and a signature", async () => {
  const { run, docSha, sig } = await setup();
  for (const body of ["x", {}, { caseId: CASE, edition: "1", expectedSha: docSha, sig }, { caseId: CASE, edition: 1, sig },
                      { caseId: CASE, edition: 1, expectedSha: docSha, sig: 7 }]) {
    const r = await run(body);
    assert.deepEqual([r.status, r.body.reason], [400, "MALFORMED"], JSON.stringify(body));
  }
});

test("R2: in order — the facts (publication's answer for a case the caller has no standing in), C-53.12, C-92.10, C-92.11, CASE_RATIFY_STALE, NO_SIGNERS, SIG_<reason>, GATE_REFUSED", async () => {
  const s = await setup({ mutate: (d) => ({ ...d, case_scope: "" }) });
  const { w, facts, docSha, sig, other, run } = s;
  const body = { caseId: CASE, edition: 1, expectedSha: docSha, sig };
  const none = await run({ ...body, edition: 9 });
  assert.deepEqual([none.status, none.body.reason], [404, "NO_CASE_DOCUMENT"]);
  const stale = { current: [{ observation: "INFO-2026-0009-o", level: "group", shown: null }], stated: [] };
  facts.attribution = { reached: [], legacy: ["INFO-2026-0008-legacy"], stated: [],
                        current: [{ observation: "INFO-2026-0009-o", level: null, why: "no choice made" }] };
  facts.doc.doc_sha = "e".repeat(64); facts.signers = [];
  const steps = [
    ["TESTIMONY_CASE_UNPUBLISHABLE", 409, "C-53.12", TESTIMONY.TESTIMONY_CASE_UNPUBLISHABLE, () => { facts.attribution.legacy = []; }],
    ["ATTRIBUTION_UNCHOSEN", 409, "C-92.10", ATTRIBUTION.ATTRIBUTION_UNCHOSEN, () => { Object.assign(facts.attribution, stale); }],
    ["ATTRIBUTION_STATEMENT_STALE", 409, "C-92.11", ATTRIBUTION.ATTRIBUTION_STATEMENT_STALE,
     () => { facts.attribution.stated = [{ observation: "INFO-2026-0009-o", level: "group", shown: null }]; }],
    ["CASE_RATIFY_STALE", 409, undefined, null, () => { facts.doc.doc_sha = docSha; }],
    ["NO_SIGNERS", 409, undefined, null, () => { facts.signers = w.credentials.attestingKeys(); }],
    ["SIG_", 403, undefined, null, () => {}],
  ];
  for (const [reason, status, check, row, relax] of steps) {
    const r = await run(reason === "SIG_" ? { ...body, sig: await signCase(other, CASE, 1, docSha) } : body);
    assert.equal(r.status, status, reason);
    assert.ok(r.body.reason.startsWith(reason), `${reason}: ${r.body.reason}`);
    if (check) assert.deepEqual([r.body.check, r.body.translation], [check, row.translation], reason);
    assert.equal(w.pub.committed.length, 0);
    relax();
  }
  const gate = await run(body);
  assert.deepEqual([gate.status, gate.body.reason], [409, "GATE_REFUSED"]);
  assert.deepEqual(gate.body.findings.map((x) => x.check), ["C-41.5"]);
  assert.equal(w.pub.committed.length, 0);
});

test("R2: a signature over other bytes, or the signature of an unregistered key, is refused", async () => {
  const { run, key, other, docSha } = await setup();
  const body = { caseId: CASE, edition: 1, expectedSha: docSha };
  assert.equal((await run({ ...body, sig: await signCase(key, CASE, 2, docSha) })).body.reason.startsWith("SIG_"), true);
  assert.equal((await run({ ...body, sig: await signCase(key, CASE, 1, "d".repeat(64)) })).body.reason.startsWith("SIG_"), true);
  assert.equal((await run({ ...body, sig: await signCase(other, CASE, 1, docSha) })).body.reason.startsWith("SIG_"), true);
});

test("R2, R3: an owner's signature through a member's session commits the case, naming signer and deliverer apart", async () => {
  const { w, run } = await setup();
  const r = await run(undefined, { session: { role: "member:bo" }, viewer: V("bo") });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 400));
  assert.deepEqual([r.body.ok, r.body.caseId, r.body.edition, r.body.attestor.member], [true, CASE, 1, "alice"]);
  assert.equal(r.body.gateVersion.startsWith("plane-gate/"), true);
  assert.match(r.body.next, /1 member finding\(s\) still to ratify/);
  assert.deepEqual([w.pub.committed[0].attestorMember, w.pub.committed[0].deliveredBy], ["alice", V("bo")]);
  assert.deepEqual(r.p.fetched, ["casedocfacts", "casetestimony", "casegate", "caseratify"]);
  assert.deepEqual(w.calls.filter((c) => c[0] === "caseDocumentFacts").map((c) => c[3]), [V("bo"), V("bo")],
    "the facts and the gate are read for the session's viewer");
  const again = await run(undefined, { session: { role: "admin" }, viewer: "member:admin" });
  assert.deepEqual([again.status, again.body.existed], [200, true], "a retry answers existed, whoever delivers it");
  assert.equal(w.pub.committed.length, 1);
});

test("R2: the store half's refusal is relayed; a store that does not answer refuses the act and commits nothing", async () => {
  const { w, run } = await setup();
  const eve = await run(undefined, { session: { role: "member:eve" }, viewer: V("eve") });
  assert.deepEqual([eve.status, eve.body.reason], [409, "PROJECT_ACT_NOT_A_PARTICIPANT"]);
  for (const op of ["casedocfacts", "casegate", "caseratify"]) {
    w.ops = { [op]: () => SILENT };
    const r = await run();
    assert.deepEqual([r.status, r.body.reason, r.body.op], [502, "STORE_SILENT", `caseratify/${op === "casedocfacts" ? "facts" : op === "casegate" ? "gate" : "commit"}`]);
  }
  assert.equal(w.pub.committed.length, 0);
});

test("R6: a case complete at its document's ratification has its container assembled once, by the one assembly", async () => {
  const { w, run } = await setup();
  const state = { complete: true, manifest_sha: null, edition: 1, findings: [] };
  const real = w.publication.commitCaseEdition;
  w.publication.commitCaseEdition = (a) => ({ ...real(a), state });
  const r = await run();
  assert.equal(r.p.assembled.length, 1);
  assert.deepEqual([r.p.assembled[0].via, r.p.assembled[0].cs], ["caseratify", state]);
  assert.deepEqual(r.body.container, { manifest_sha: "m".repeat(64), zip: "z" });
  assert.equal("completedCase" in r.body, false, "the store's internal state is not spread into the answer");
});

test("R2, R4: the ceremonies' dispatch answers op=caseratify and op=ratify through their handlers, and no other op", async () => {
  const { w, run, docSha, sig } = await setup();
  const body = { caseId: CASE, edition: 1, expectedSha: docSha, sig };
  const direct = await run(body, { aiCred: { tokenId: "t1" }, cls: "ai" });
  const p = plane(w, { aiCred: { tokenId: "t1" }, cls: "ai" });
  const via = await ratificationOp("caseratify", p.request(body), p.stub, p.ctx);
  assert.deepEqual([via.status, via.body], [direct.status, direct.body]);
  const ratify = await ratificationOp("ratify", p.request({}), p.stub, p.ctx);
  assert.deepEqual([ratify.status, ratify.body.reason], [403, "MACHINE_CANNOT_RATIFY"]);
  for (const op of ["publish", "gatefacts", "release", "", undefined]) assert.equal(ratificationOp(op, p.request({}), p.stub, p.ctx), null, String(op));
  assert.deepEqual(p.fetched, [], "nothing was asked of the store");
});

test("R38: a case document carrying a malformed working_on is refused GATE_REFUSED with C-41.17 before any write; a notice id commits", async () => {
  const bad = await setup({ mutate: (d) => ({ ...d, working_on: "not-a-notice" }) });
  const r = await bad.run();
  assert.deepEqual([r.status, r.body.reason, r.body.findings.map((x) => x.check)], [409, "GATE_REFUSED", ["C-41.17"]]);
  assert.equal(bad.w.pub.committed.length, 0);
  assert.equal(bad.w.row(`SELECT ratified_at FROM case_documents WHERE case_id=?`, CASE).ratified_at, null, "nothing written");
  const good = await setup({ mutate: (d) => ({ ...d, working_on: "NOTICE-2026-0001" }) });
  const ok = await good.run();
  assert.deepEqual([ok.status, ok.body.ok], [200, true], JSON.stringify(ok.body).slice(0, 300));
});

/* R39 (K1316, K1317): after the commit, each material publication's commit answers `held: "evidence"` (its R57) is
   copied from the evidence store into the published bucket by its SHA-256; a re-sent op=caseratify retries through
   `heldMaterialsOf`; the answer states `materials_copied`, and a missing one never changes `ok`. */
test("R39: each evidence-held material is copied by its SHA-256 after the commit, one already published is present, one the evidence store lacks or whose put fails is missing and never changes ok; inline material is not copied; a re-sent op=caseratify retries through heldMaterialsOf", async () => {
  const { w, docSha, sig } = await setup();
  const A = "a1".repeat(32), B = "b2".repeat(32), C = "c3".repeat(32);
  const held = [{ sha: A, held: "evidence" }, { sha: B, held: "evidence" }, { sha: C, held: "inline" }];
  const real = w.publication.commitCaseEdition;
  w.publication.commitCaseEdition = (a) => ({ ...real(a), materials: held });
  const body = { caseId: CASE, edition: 1, expectedSha: docSha, sig };
  const bytesA = new TextEncoder().encode("document A, whole");
  const p1 = plane(w);
  p1.captures.set(`s/captures/${A}`, bytesA);
  const first = await caseRatifyOp(p1.request(body), p1.stub, p1.ctx);
  assert.deepEqual([first.status, first.body.ok], [200, true], JSON.stringify(first.body).slice(0, 300));
  assert.deepEqual(first.body.materials_copied, { copied: 1, present: 0, missing: [B] });
  assert.deepEqual(p1.published.get(`s/published/${A}`), bytesA, "copied by its SHA-256, byte for byte");
  assert.equal(p1.published.has(`s/published/${C}`), false, "inline material is publication's, never copied here");
  assert.equal("evidenceMaterials" in first.body, false, "the store's internal list is not spread into the answer");
  assert.equal(w.pub.committed.length, 1);
  /* the retry: the same signature answers existed, and the missing material is copied from heldMaterialsOf's list */
  const asked = [];
  w.publication.heldMaterialsOf = (c, e) => (asked.push([c, e]), held);
  const p2 = plane(w);
  p2.published.set(`s/published/${A}`, bytesA);
  p2.captures.set(`s/captures/${B}`, new TextEncoder().encode("document B"));
  const retry = await caseRatifyOp(p2.request(body), p2.stub, p2.ctx);
  assert.deepEqual([retry.status, retry.body.ok, retry.body.existed], [200, true, true]);
  assert.deepEqual(retry.body.materials_copied, { copied: 1, present: 1, missing: [] });
  assert.deepEqual(asked, [[CASE, 1]]);
  assert.equal(w.pub.committed.length, 1, "the retry commits nothing");
  /* a put that fails is missing, and ok stands */
  const p3 = plane(w);
  p3.captures.set(`s/captures/${A}`, bytesA); p3.captures.set(`s/captures/${B}`, bytesA);
  p3.ctx.env.PUBLISHED.put = async () => { throw new Error("bucket refused"); };
  const failed = await caseRatifyOp(p3.request(body), p3.stub, p3.ctx);
  assert.deepEqual([failed.status, failed.body.ok, failed.body.materials_copied], [200, true, { copied: 0, present: 0, missing: [A, B] }]);
  /* negative control: a commit holding nothing in the evidence store copies nothing */
  const none = await setup();
  const r = await none.run();
  assert.deepEqual([r.status, r.body.materials_copied, r.p.published.size], [200, { copied: 0, present: 0, missing: [] }, 0]);
});
