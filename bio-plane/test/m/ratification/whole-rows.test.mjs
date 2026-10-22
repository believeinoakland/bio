/* ratification: the publish of a bundle held in parts is unchanged by the whole's row (R56; fix round 4b, F3 verification,
   K4508; provenance R72, R73). The register is the real provenance's, run on the audit's fixture: a document of three
   real parts promoted by the real chain as the capture screen promotes it (the register list holds the parts alone, R72
   adds the whole's row, which has no file of the bundle at its path). `gateFacts` and `ratifyGate` read it, and the
   part-by-part publish (`parted`) crosses the parts' files only. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signBundle, cleanInfoMd, sha, V } from "./fixture.mjs";
import { world as provenanceWorld, infoMd as provenanceInfoMd } from "../provenance/fixture.mjs";
import { ratifyOp } from "../../../src/ratification/ops.mjs";
import { findingShas } from "../../../src/ratification/finding.mjs";

const DOC = "INFO-2026-0001-report";
const PARTS = [Buffer.from("alpha ".repeat(30)), Buffer.from("beta ".repeat(44)), Buffer.from("gamma, the last part")];
const WHOLE = sha(Buffer.concat(PARTS));
const held = PARTS.map((b, i) => ({ file: `snapshots/report.pdf.part${String(i).padStart(3, "0")}`, sha256: sha(b), bytes: b.length }));
const provenanceDoc = JSON.stringify({ documents: [{ file: "snapshots/report.pdf", locator: "https://example.org/a", retrieved: "2026-07-01T00:00:00Z",
  authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
  capture: { method: "acquire", grade: "B", actor_class: "session", sha256: WHOLE, encoding: "binary", bytes: Buffer.concat(PARTS).length },
  origin: { kind: "named_request" }, parts: held }] }, null, 1);
const partFiles = held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }));
const register = held.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes }));

/* the real chain: the register as provenance writes it for this bundle (parts' rows and the whole's row) */
function realProvenance() {
  const pw = provenanceWorld();
  const r = pw.promotion.promote({ bundleId: DOC, base: null, snapKey: "mp", author: "member:alice", meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: provenanceInfoMd(DOC) }, { path: "data/provenance.json", text: provenanceDoc }, ...partFiles], register });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(pw.prov.homeOf(WHOLE)?.bundleId, DOC, "R72: the whole has its row");
  return pw.prov;
}

async function setup() {
  const w = world();
  const real = realProvenance();
  w.provenance.registeredFor = (id) => real.registeredFor(id);
  w.provenance.registerHolds = (a) => real.registerHolds(a);
  const key = await newKey();
  w.member("alice", { signer: key });
  const P = w.project("Team", "alice", { joined: [] });
  const r = w.promotion.promote({ bundleId: DOC, base: null, snapKey: "k-mp", author: V("alice"), meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: cleanInfoMd(DOC) }, { path: "data/provenance.json", text: provenanceDoc }, ...partFiles] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  w.pub.resting.set(DOC, [{ case_id: "CASE-2026-0001", finding: "INQ-2026-0001-finding", project: P }]);   /* it crosses as evidence of a ratified case */
  const head = w.sha(DOC);
  const sig = await signBundle(key, DOC, head);
  /* the parts are in the working bucket; no object under the whole's hash */
  for (const [i, p] of held.entries()) w.evidence.set(`bio/captures/${p.sha256}`, new Uint8Array(PARTS[i]));
  return { w, head, sig, real };
}

test("R56: gateFacts lists the whole's row beside its parts' and ratifyGate passes the bundle: the whole is admitted as held in parts, the gate raises no finding for any of them", async () => {
  const { w, real } = await setup();
  const gf = w.r.gateFacts(DOC, null);
  assert.equal(gf.ok, true);
  assert.deepEqual(gf.registers.map((x) => x.capture_sha).sort(), [WHOLE, ...held.map((p) => p.sha256)].sort());
  const image = w.record.readImage(DOC);
  const gate = await w.r.ratifyGate({ bundleId: DOC, image, knownIds: new Set([DOC]), registers: gf.registers,
    publishedRegistry: null, publishedCaseRegistry: null, earnedRegistry: null });
  assert.deepEqual((gate.findings || []).filter((f) => /^PLANE_|^C-18\./.test(f.check)).map((f) => f.check), [], JSON.stringify(gate.findings));
  assert.deepEqual(gate.parted.map(([s, ps]) => [s, ps.map((p) => p.sha256)]), [[WHOLE, held.map((p) => p.sha256)]]);
  /* control: a part gone from the working bucket is still named, whole row or not */
  w.evidence.delete(`bio/captures/${held[1].sha256}`);
  const lost = await w.r.ratifyGate({ bundleId: DOC, image, knownIds: new Set([DOC]), registers: gf.registers,
    publishedRegistry: null, publishedCaseRegistry: null, earnedRegistry: null });
  assert.ok((lost.findings || []).some((f) => f.check === "PLANE_PART_MISSING"), JSON.stringify(lost.findings));
  assert.deepEqual(lost.parted, []);
  assert.ok(real);
});

test("R56: the part-by-part publish crosses the parts' files only: no file of the whole's row, nothing under the whole's hash, every part verified at the destination", async () => {
  const { w, head, sig } = await setup();
  const p0 = plane(w);
  for (const [i, p] of held.entries()) p0.captures.set(`s/captures/${p.sha256}`, new Uint8Array(PARTS[i]));
  const res = await ratifyOp(p0.request({ bundleId: DOC, expectedSha: head, sig }), p0.stub, p0.ctx);
  assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 500));
  assert.deepEqual(res.body.published.parts, { parts: 3, verified: 3 });
  for (const p of held) assert.ok(p0.published.has(`s/published/${p.sha256}`), `part ${p.file} crossed`);
  assert.ok(!p0.published.has(`s/published/${WHOLE}`), "nothing under the whole's hash");
  const [, a] = w.calls.find((c) => c[0] === "commitEdition");
  const files = a.shas.filter((s) => s.kind === "capture" || s.kind === "capture_part");
  assert.deepEqual(files.map((s) => s.path).sort(), held.map((p) => p.file).sort(), "the parts' files, and no path of the whole's row");
  assert.ok(a.shas.every((s) => s.sha256 !== WHOLE && s.path !== "snapshots/report.pdf"));
});

test("R56: findingShas never publishes the whole's row as a file of its own, whichever way the image names the parts", async () => {
  const { w } = await setup();
  const registers = w.provenance.registeredFor(DOC);
  const partedRows = new Map([[WHOLE, held]]);
  const image = { "bundle.md": cleanInfoMd(DOC), ...Object.fromEntries(held.map((p) => [p.file, { blobSha: p.sha256 }])) };
  const { shas, partShaSet } = await findingShas(image, partedRows, registers);
  assert.deepEqual(shas.filter((s) => s.kind !== "bundle").map((s) => s.sha256).sort(), held.map((p) => p.sha256).sort());
  assert.deepEqual([...partShaSet].sort(), held.map((p) => p.sha256).sort());
  /* a part the image does not carry as a file joins the list under the path the record names, never the whole's */
  const bare = await findingShas({ "bundle.md": cleanInfoMd(DOC) }, partedRows, registers);
  assert.deepEqual(bare.shas.filter((s) => s.kind === "capture_part").map((s) => s.path).sort(), held.map((p) => p.file).sort());
});
