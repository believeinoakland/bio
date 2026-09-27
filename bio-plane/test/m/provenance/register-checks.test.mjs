/* provenance: the C-18 register arms (R42–R46): each keeps its catalogue id and severity, refuses at the write through
   the module's registered check, and still runs at the gate (`withRegisterChecks`) and in the audit
   (`provenanceAudit`). C-18.6 (R45) hashes stored bytes and stays in the catalogue, run by the gate (K72 (4)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, provDoc, infoMd } from "./fixture.mjs";
import { registerChecks, withRegisterChecks, provenanceAudit } from "../../../src/provenance/index.mjs";
import { checkBundle, parseFrontmatter } from "../../../checks/bio-checks.mjs";

const run = (docs, { md = infoMd("INFO-2026-0001-x"), files = {}, reg = null } = {}) => registerChecks({
  files: new Map([["bundle.md", md], ["data/provenance.json", reg ?? JSON.stringify({ documents: docs })], ...Object.entries(files)]),
  fm: parseFrontmatter(md).data });
const cap = { path: "snapshots/a.txt", text: "bytes of a" };
const good = provDoc(cap);
const ids = (f) => f.map((x) => `${x.check}/${x.severity}`);

test("R42: C-18.1, the register's shape, release authority and the sweep fence, as errors", () => {
  assert.deepEqual(run([good], { files: { [cap.path]: cap.text } }), []);
  assert.deepEqual(ids(run([], { reg: JSON.stringify({ nope: 1 }) })), ["C-18.1/error"]);
  const bad = run([{ ...good, file: "missing.txt", locator: "", authority: undefined, authority_state: "sometimes",
                     capture: { grade: "A+", actor_class: "robot" }, origin: { kind: "sweep" } }]);
  const msgs = bad.map((x) => x.message).join("\n");
  for (const m of [/missing 'locator'/, /authority_state 'sometimes'/, /names 'missing.txt'/, /capture missing 'method'/,
                   /grade 'A\+'/, /actor_class 'robot'/, /matched_sweep/, /deeming_actor/]) assert.match(msgs, m);
  assert.equal(bad.every((x) => x.check === "C-18.1" && x.severity === "error"), true);
  /* Undetermined authority needs a basis; determined needs one too. */
  assert.match(run([{ ...good, authority: undefined, authority_state: "undetermined", authority_basis: "" }],
                   { files: { [cap.path]: cap.text } })[0].message, /names no authority_basis/);
  /* An authored observation: no capture grade, actor and origin member. */
  const authored = run([{ ...good, authored: true, capture: { ...good.capture, grade: "B", actor_class: "session" }, origin: { kind: "named_request" } }],
                       { files: { [cap.path]: cap.text } }).map((x) => x.message).join("\n");
  assert.match(authored, /carries capture.grade 'B'/);
  assert.match(authored, /actor_class is 'session', not 'member'/);
  assert.match(authored, /origin.kind is 'named_request', not 'member'/);
  /* A collected -> verified release by a machine; a sweep intake verified without a member's release. */
  const hist = `  - timestamp: "2026-09-20T00:00:00Z"\n    from_state: collected\n    to_state: verified\n    author: token:member`;
  const md = infoMd("INFO-2026-0001-x", { state: "verified", history: hist });
  const machine = run([{ ...good, provenance_chain: [{ who: "x" }], origin: { kind: "sweep", matched_sweep: "s", deeming_actor: "d" } }],
                      { md, files: { [cap.path]: cap.text } });
  assert.equal(machine.some((x) => /release is a named member's decision/.test(x.message)), true);
  assert.equal(machine.some((x) => /sweep-origin intake lands at collected/.test(x.message)), true);
  /* information@2: the register's @2 shapes (encoding, custody, parts, derived, renditions, releases). */
  const md2 = infoMd("INFO-2026-0002-y").replace("schema: information@1", "schema: information@2");
  const at2 = run([{ ...good, capture: { ...good.capture, encoding: "rot13" }, parts: [], derived: {}, renditions: "x" }],
                  { md: md2, files: { [cap.path]: cap.text } }).map((x) => x.message).join("\n");
  for (const m of [/capture.encoding 'rot13'/, /parts must be a nonempty array/, /derived lacks/, /renditions must be an array/])
    assert.match(at2, m);
  assert.deepEqual(ids(registerChecks({ files: new Map([["bundle.md", md2]]), fm: parseFrontmatter(md2).data })), ["C-18.1/error"],
                   "information@2 requires the register");
  /* At the write: refused, naming the findings. */
  const w = world();
  const r = w.promoteInfo("INFO-2026-0003-z", { captures: [cap], docs: [{ ...good, capture: { ...good.capture, method: "" } }] });
  assert.deepEqual([r.ok, r.reason, r.findings[0].check], [false, "PROVENANCE_REGISTER_REFUSED", "C-18.1"]);
  assert.equal(w.head("INFO-2026-0003-z"), null, "nothing written");
});

test("R42: at the write, a revision is refused only for a violation it adds; a replay is exempt", () => {
  const w = world();
  const a = { ...cap };
  /* A bundle held with an inherited violation (written as a replay, as history is). */
  const old = { ...provDoc(a), authority: undefined, authority_state: undefined };
  const r0 = w.promoteInfo("INFO-2026-0001-x", { captures: [a], docs: [old], pkg: { replay: true } });
  assert.equal(r0.ok, true, JSON.stringify(r0));
  /* A revision that keeps the inherited violation and adds nothing is accepted: correction moves forward. */
  const r1 = w.promoteInfo("INFO-2026-0001-x", { captures: [a], docs: [old], base: w.head("INFO-2026-0001-x").bundleSha });
  assert.equal(r1.ok, true, JSON.stringify(r1));
  /* One that adds a violation is refused, naming only the added one. */
  const r2 = w.promoteInfo("INFO-2026-0001-x", { captures: [a], docs: [{ ...old, locator: "" }], base: w.head("INFO-2026-0001-x").bundleSha });
  assert.equal(r2.reason, "PROVENANCE_REGISTER_REFUSED");
  assert.deepEqual(r2.findings.map((f) => f.detail), ["provenance documents[0] missing 'locator'"]);
  /* A bundle that is not information, or carries no register, is not asked. */
  const w2 = world();
  const q = w2.promotion.promote({ bundleId: "INFO-2026-0002-n", base: null, snapKey: "n", author: "member:a",
    meta: { object_type: "information" }, files: [{ path: "bundle.md", text: infoMd("INFO-2026-0002-n") }] });
  assert.equal(q.ok, true);
});

test("R43: C-18.3, one capture once in a register, raw or by determined evidentiary digest", () => {
  const b = { path: "snapshots/b.txt", text: "bytes of b" };
  const files = { [cap.path]: cap.text, [b.path]: b.text };
  assert.deepEqual(ids(run([good, provDoc(cap)], { files })), ["C-18.3/error"]);
  const dg = (e, determined = true) => ({ profile: { digests: { determined, evidentiary: e } } });
  assert.deepEqual(ids(run([{ ...good, ...dg("e1") }, { ...provDoc(b), ...dg("e1") }], { files })), ["C-18.3/error"]);
  assert.deepEqual(run([{ ...good, ...dg(null, false) }, { ...provDoc(b), ...dg(null, false) }], { files }), [],
                   "an undetermined digest is never compared");
  const w = world();
  const r = w.promoteInfo("INFO-2026-0001-x", { captures: [cap], docs: [good, provDoc(cap)] });
  assert.equal(r.findings[0].check, "C-18.3");
});

test("R44: C-18.4, a crucial document with neither co-archive nor timestamp is flagged as a warning, never refused", () => {
  const md = infoMd("INFO-2026-0001-x", { criticality: "crucial" });
  const f = run([good], { md, files: { [cap.path]: cap.text } });
  assert.deepEqual(ids(f), ["C-18.4/warn"]);
  assert.deepEqual(run([{ ...good, timestamp: { authority: "t" } }], { md, files: { [cap.path]: cap.text } }), []);
  assert.deepEqual(run([{ ...good, co_archive: { locator: "x" } }], { md, files: { [cap.path]: cap.text } }), []);
  const w = world();
  assert.equal(w.promoteInfo("INFO-2026-0002-c", { captures: [cap], criticality: "crucial" }).ok, true);
});

test("R45: C-18.6, every registered capture's stored bytes hash to the recorded digest, at the gate", async () => {
  const md = infoMd("INFO-2026-0001-x").replace("schema: information@1", "schema: information@2");
  const hash = async (v) => sha(typeof v === "string" ? v : Buffer.from(v));
  const gate = async (docs, files) => (await checkBundle({ folderName: "INFO-2026-0001-x", sha256: hash,
    files: new Map([["bundle.md", md], ["data/provenance.json", JSON.stringify({ documents: docs })], ...Object.entries(files)]) }))
    .findings.filter((x) => x.check === "C-18.6");
  const doc = { ...good, capture: { ...good.capture, sha256: sha(cap.text), encoding: "utf8" } };
  assert.deepEqual(await gate([doc], { [cap.path]: cap.text }), []);
  const moved = await gate([doc], { [cap.path]: "mutated bytes" });
  assert.deepEqual(moved.map((x) => x.severity), ["error"]);
  assert.match(moved[0].message, /silent content mutation/);
  /* Parts stream in order; a base64 capture decodes first; undecodable bytes are refused with the reason. */
  const p1 = "first half ", p2 = "second half";
  const partsDoc = { ...doc, capture: { ...doc.capture, sha256: sha(p1 + p2) },
                     parts: [{ file: "p0", sha256: sha(p1), bytes: p1.length }, { file: "p1", sha256: sha(p2), bytes: p2.length }] };
  assert.deepEqual(await gate([partsDoc], { p0: p1, p1: p2 }), []);
  assert.equal((await gate([partsDoc], { p0: p2, p1: p1 })).length, 1, "order matters");
  const b64 = { ...doc, capture: { ...doc.capture, encoding: "base64", sha256: sha(cap.text) } };
  assert.deepEqual(await gate([b64], { [cap.path]: Buffer.from(cap.text).toString("base64") }), []);
  const undecodable = await gate([b64], { [cap.path]: "***not base64***" });
  assert.match(undecodable[0].message, /could not be decoded/);
});

test("R46: C-18.9, at or past verified every document records a chain whose hops name their attestors, and its authority", () => {
  const md = infoMd("INFO-2026-0001-x", { state: "verified" });
  const f = (d) => run([d], { md, files: { [cap.path]: cap.text } }).filter((x) => x.check === "C-18.9");
  const absent = f(good);
  assert.deepEqual([absent.length, absent[0].code, absent[0].severity], [1, "chain-absent", "error"]);
  assert.equal(f({ ...good, provenance_chain: null })[0].code, "chain-not-an-array");
  assert.equal(f({ ...good, provenance_chain: [] })[0].code, "chain-empty");
  assert.match(f({ ...good, provenance_chain: [{ who: " " }] })[0].message, /names no attestor/);
  assert.deepEqual(f({ ...good, provenance_chain: [{ who: "instance x" }] }), []);
  assert.match(f({ ...good, provenance_chain: [{ who: "x" }], authority: undefined, authority_state: "undetermined", authority_basis: "" })[0].message,
               /states no authority_basis/);
  assert.match(f({ ...good, provenance_chain: [{ who: "x" }], authority: "", authority_state: "determined" })[0].message,
               /no authority named/);
  /* Below verified the arm does not apply. */
  assert.deepEqual(run([good], { files: { [cap.path]: cap.text } }).filter((x) => x.check === "C-18.9"), []);
});

test("R42–R46: the arms still run at the gate and in the audit, so moving them lost none", async () => {
  const md = infoMd("INFO-2026-0001-x", { state: "verified" });
  const image = { "bundle.md": md, "data/provenance.json": JSON.stringify({ documents: [good] }), [cap.path]: cap.text };
  const gated = withRegisterChecks(image, { gateVersion: "g", ok: true, findings: [], warnings: 0 });
  assert.deepEqual([gated.ok, gated.findings.map((x) => x.check)], [false, ["C-18.9"]]);
  const clean = withRegisterChecks({ ...image, "bundle.md": infoMd("INFO-2026-0001-x") }, { gateVersion: "g", ok: true, findings: [], warnings: 2 });
  assert.deepEqual([clean.ok, clean.warnings], [true, 2]);
  /* The audit: a bundle held with a C-18 violation (a replay) is counted with errors and tallied under its check. */
  const w = world();
  w.promoteInfo("INFO-2026-0001-x", { captures: [cap], state: "verified", pkg: { replay: true } });
  const pass = await provenanceAudit(w.host, { after: "", limit: 10, visible: () => true });
  assert.equal(pass.tally["C-18.9"] >= 1, true, JSON.stringify(pass.tally));
  assert.equal((pass.tallyDetail || {})["C-18.9/chain-absent"] >= 1, true);
  assert.equal(pass.offenders.some((o) => o.bundleId === "INFO-2026-0001-x"), true);
  assert.equal(pass.withErrors >= 1, true);
});
