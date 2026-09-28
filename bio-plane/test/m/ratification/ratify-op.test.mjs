/* ratification R4: `op=ratify` at the control plane (`ratifyOp`, the Worker half), in its order of refusals; R5's
   refusals relayed; R6: after the commit every part is copied to the published store by hash, the case container is
   assembled when the last member lands, and the reuse report is carried. R16 waits on publication R35. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signBundle, cleanInfoMd, V, SILENT } from "./fixture.mjs";
import { ratifyOp } from "../../../src/ratification/ops.mjs";
import { RATIFY_MACHINE_FENCE_CHECKS as FENCE, RATIFY_TESTIMONY_CHECKS as TESTIMONY,
         RATIFY_ATTRIBUTION_CHECKS as ATTRIBUTION, RATIFY_SCOPE_CHECKS as SCOPE } from "../../../src/ratification/index.mjs";

const DOC = "INFO-2026-0001-report", Q = "INQ-2026-0001-finding";
const SIGNED = new WeakMap();

async function setup() {
  const w = world();
  const key = await newKey(), other = await newKey();
  w.member("alice", { signer: key }); w.member("bo"); w.member("eve");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.promote(DOC, cleanInfoMd(DOC), "information");
  w.pub.resting.set(DOC, [{ case_id: "CASE-2026-0001", finding: Q, project: P }]);
  const sha = w.sha(DOC);
  const sig = await signBundle(key, DOC, sha);
  SIGNED.set(w, sig);
  const run = async (body = { bundleId: DOC, expectedSha: sha, sig }, o = {}) => {
    const p = plane(w, o);
    const res = await ratifyOp(p.request(body), p.stub, p.ctx);
    return { ...res, p };
  };
  return { w, P, key, other, sha, sig, run };
}

test("R4: a machine credential is refused C-32.12 before the payload is read; any caller not arriving through a member's session C-32.14", async () => {
  const { run } = await setup();
  const m = await run("x", { aiCred: { tokenId: "t1" }, cls: "ai" });
  assert.deepEqual([m.status, m.body.reason, m.body.check, m.body.translation], [403, "MACHINE_CANNOT_RATIFY", "C-32.12",
    FENCE.MACHINE_CANNOT_RATIFY.translation]);
  const o = await run("x", { viaSession: false, cls: "admin" });
  assert.deepEqual([o.status, o.body.reason, o.body.check, o.body.tokenClass], [403, "OPERATOR_TOKEN_CANNOT_RATIFY", "C-32.14", "admin"]);
  assert.deepEqual([m.p.fetched, o.p.fetched], [[], []]);
});

test("R4: MALFORMED without bundleId, expectedSha and a signature", async () => {
  const { run, sha, sig } = await setup();
  for (const body of ["x", {}, { bundleId: DOC, sig }, { expectedSha: sha, sig }, { bundleId: DOC, expectedSha: sha, sig: 1 }])
    assert.deepEqual([(await run(body)).status, (await run(body)).body.reason], [400, "MALFORMED"], JSON.stringify(body));
});

test("R4, R7: a bundle the caller cannot see answers exactly as one never minted, read for the session's viewer", async () => {
  const { run, P, sig } = await setup();
  const hidden = await run({ bundleId: P, expectedSha: "a".repeat(64), sig }, { session: { role: "member:eve" }, viewer: V("eve") });
  const absent = await run({ bundleId: "PROJ-2026-0404-x", expectedSha: "a".repeat(64), sig }, { session: { role: "member:eve" }, viewer: V("eve") });
  assert.equal(hidden.status, 404);
  assert.equal(JSON.stringify(hidden.body).replace(P, "X"), JSON.stringify(absent.body).replace("PROJ-2026-0404-x", "X"));
});

test("R4: in order — C-58.1, C-53.10, C-53.11, C-92.12, RATIFY_STALE, NO_SIGNERS, SIG_<reason>, GATE_REFUSED", async () => {
  const { w, P, run, sha, sig, other } = await setup();
  const proj = await run({ bundleId: P, expectedSha: w.sha(P), sig });
  assert.deepEqual([proj.status, proj.body.reason, proj.body.check, proj.body.translation],
    [409, "RATIFY_PROJECT_BUNDLE", "C-58.1", SCOPE.RATIFY_PROJECT_BUNDLE.translation]);
  const legacy = new Set([DOC, "INFO-2026-0007-obs"]);
  w.publication.observationsNamingAuthor = (ids) => ids.filter((x) => legacy.has(x));
  w.bv.reach = { self: [DOC], via: [{ finding: DOC, observation: "INFO-2026-0007-obs" }] };
  w.st.sql.exec(`UPDATE signers SET status='revoked'`);
  const body = { bundleId: DOC, expectedSha: "f".repeat(64), sig };
  const steps = [
    ["TESTIMONY_UNPUBLISHABLE", 409, "C-53.10", TESTIMONY.TESTIMONY_UNPUBLISHABLE, () => { legacy.delete(DOC); }],
    ["TESTIMONY_CITED_UNPUBLISHABLE", 409, "C-53.11", TESTIMONY.TESTIMONY_CITED_UNPUBLISHABLE, () => { legacy.clear(); }],
    ["ATTRIBUTION_UNSTATED", 409, "C-92.12", ATTRIBUTION.ATTRIBUTION_UNSTATED, () => { w.publication.attributionStatedFor = () => true; }],
    ["RATIFY_STALE", 409, null, null, () => { body.expectedSha = sha; }],
    ["NO_SIGNERS", 409, null, null, () => { w.st.sql.exec(`UPDATE signers SET status='active'`); body.sig = null; }],
  ];
  for (const [reason, status, check, row, relax] of steps) {
    const r = await run(body);
    assert.deepEqual([r.status, r.body.reason], [status, reason], reason);
    if (check) assert.deepEqual([r.body.check, r.body.translation], [check, row.translation], reason);
    relax();
  }
  const bad = await run({ ...body, sig: await signBundle(other, DOC, sha) });
  assert.deepEqual([bad.status, bad.body.reason], [403, "SIG_UNKNOWN_KEY"]);
  w.ops.image = () => ({ "bundle.md": "no front matter" });
  const gate = await run({ ...body, sig });
  assert.deepEqual([gate.status, gate.body.reason], [409, "GATE_REFUSED"]);
  assert.ok(gate.body.findings.length > 0);
  assert.deepEqual(w.pub.editions, [], "nothing crossed");
});

test("R4, R9: the gate joins C-2.8's case-member arm over the same image", async () => {
  const { w, run } = await setup();
  w.ops.image = (url) => {
    const img = w.record.readImage(url.searchParams.get("id"));
    img["bundle.md"] = img["bundle.md"].replace("criticality: supporting",
      "criticality: supporting\nedition: 0\npublished_strength:\n  - axis: capture\n    state: unrated\n    grade: null\n  - axis: connection\n    state: unrated\n    grade: null");
    return img;
  };
  const r = await run();
  assert.equal(r.body.reason, "GATE_REFUSED");
  assert.ok(r.body.findings.some((x) => x.check === "C-2.8" && /integer edition/.test(x.detail)), JSON.stringify(r.body.findings).slice(0, 500));
});

test("R5 through R4: the store half's scope refusals are relayed at 409; a store that does not answer before the commit refuses the act", async () => {
  const { w, run } = await setup();
  w.pub.resting.delete(DOC);
  const r = await run();
  assert.deepEqual([r.status, r.body.reason, r.body.check], [409, "RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE", "C-58.3"]);
  for (const [op, name] of [["gatefacts", "gatefacts"], ["image", "image"], ["list", "list"], ["publish", "publish"]]) {
    w.ops = { [op]: () => SILENT };
    const s = await run();
    assert.deepEqual([s.status, s.body.op], [502, `ratify/${name}`], op);
  }
});

test("R4, R6: an owner's signature crosses; every part is copied to the published store by hash, once; a retry is idempotent", async () => {
  const { w, run, sha } = await setup();
  const r = await run(undefined, { session: { role: "member:bo" }, viewer: V("bo") });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 500));
  assert.deepEqual([r.body.bundleId, r.body.bundleSha, r.body.edition, r.body.existed, r.body.attestor],
    [DOC, sha, 1, false, "alice"]);
  assert.deepEqual(r.body.published, { shas: 1, copied: 1, alreadyPresent: 0, r2: "ok" });
  assert.equal(new TextDecoder().decode(r.p.published.get(`s/published/${sha}`)), w.record.readFile(DOC, "bundle.md").text);
  const [, a] = w.calls.find((c) => c[0] === "commitEdition");
  assert.deepEqual([a.attestorMember, a.deliveredBy, a.shas], ["alice", V("bo"), [{ sha256: sha, path: "bundle.md", kind: "bundle", bytes: a.shas[0].bytes }]]);
  assert.equal("edition" in a, false, "an information bundle names no edition");
  const p = r.p;
  const retry = await ratifyOp(p.request({ bundleId: DOC, expectedSha: sha, sig: SIGNED.get(w) }), p.stub, p.ctx);
  assert.deepEqual(retry.body.published, { shas: 1, copied: 0, alreadyPresent: 1, r2: "ok" }, "an existing key is immutable and skipped");
  assert.deepEqual([retry.status, retry.body.existed], [200, true]);
  assert.equal(w.pub.editions.length, 1);
});

test("R6: when the last member of a case edition lands its container is assembled once; an assembled one is named, not rebuilt", async () => {
  const { w, run } = await setup();
  const cs = { case_id: "CASE-2026-0001", edition: 1, complete: true, manifest_sha: null, awaiting: [], findings: [{ bundle_id: DOC }] };
  w.publication.commitEdition = () => ({ ok: true, existed: false, edition: 1, caseId: "CASE-2026-0001", case: cs });
  const r = await run();
  assert.deepEqual([r.p.assembled.length, r.p.assembled[0].via, r.p.assembled[0].cs], [1, "ratify", cs]);
  assert.deepEqual(r.body.case, { edition: 1, complete: true, awaiting: [], findings: [DOC], detail: null });
  assert.equal("opened" in r.body.case, false);
  const several = [{ ...cs, case_id: "CASE-2026-0002" }, { ...cs, case_id: "CASE-2026-0003", manifest_sha: "x".repeat(64) }];
  w.publication.commitEdition = () => ({ ok: true, existed: false, edition: 1, containerCases: several });
  const s = await run();
  assert.deepEqual(s.p.assembled.map((a) => a.cs.case_id), ["CASE-2026-0002"]);
  w.publication.commitEdition = () => ({ ok: true, existed: true, edition: 1, caseId: "CASE-2026-0001",
                                         case: { ...cs, manifest_sha: "y".repeat(64) } });
  const done = await run();
  assert.deepEqual([done.p.assembled.length, done.body.container.manifest_sha], [0, "y".repeat(64)]);
});

test("R6: every reused part carries an outcome in the answer and in the record; a store silence after the commit is stated, never a refusal", async () => {
  const { w, run } = await setup();
  const part = { address: "ftp://example.org/a", primary_sha: "p".repeat(64), host: "example.org",
                 address_norm: "example.org/a", reused_sha: "r".repeat(64) };
  const recorded = [];
  w.ops.reusedparts = () => ({ parts: [part] });
  w.ops.recordreuseverdicts = (url, body) => { recorded.push(body); return { ok: true }; };
  const r = await run();
  assert.deepEqual([r.body.reuse.reused_parts, r.body.reuse.unavailable, r.body.reuse.outcomes[0].verdict], [1, 1, "unavailable"]);
  assert.deepEqual(recorded.map((b) => [b.bundleId, b.verdicts.length]), [[DOC, 1]]);
  w.ops.reusedparts = () => SILENT;
  const s = await run();
  assert.deepEqual([s.status, s.body.ok, s.body.reuse.reason, s.body.reuse.op], [200, true, "STORE_SILENT", "ratify/reusedparts"]);
});

test.todo("R16: a `name` edge to a target published later becomes `serve` — publication R35 is not yet met (K102); this module passes the edges to commitEdition and R35 turns them");

test("R15: no place is named in either ceremony's answers", async () => {
  const { w, P, run, sig } = await setup();
  const said = [];
  said.push((await run("x", { aiCred: { tokenId: "t" }, cls: "ai" })).body, (await run("x", { viaSession: false, cls: "admin" })).body,
            (await run({ bundleId: P, expectedSha: w.sha(P), sig })).body, (await run()).body);
  w.pub.resting.delete(DOC);
  said.push((await run()).body, w.r.publish({ bundleId: Q, bundleSha: "a".repeat(64), attestorKey: "k", gateVersion: "g",
                                              sigArmored: "s", shas: [] }));
  assert.doesNotMatch(JSON.stringify(said), /oakland|alameda|california|berkeley/i);
});
