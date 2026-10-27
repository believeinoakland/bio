/* ratification R60 (fix round 8, G120): the sign act's independent calls run together. The stand-ins answer after a real
   wait (an await, so overlap is measurable), and every call is recorded with its start and end. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signCase, cleanCase, fmText, CASE_BODY, V, bucketOver } from "./fixture.mjs";
import { caseRatifyOp, copyMaterialsDetailed } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";

const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-27T10:00:00Z" };
const WAIT = 8;
const nap = () => new Promise((r) => setTimeout(r, WAIT));
const SHAS = Array.from({ length: 12 }, (_, i) => String(i + 10).repeat(32));

async function setup() {
  const w = world();
  const key = await newKey();
  w.member("alice", { signer: key }); w.member("bo");
  const P = w.project("Team", "alice", { joined: ["bo"] });
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] });
  const text = fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
    attribution: { reached: [], legacy: [], stated: [], current: [] },
    signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  const real = w.publication.commitCaseEdition;
  w.publication.commitCaseEdition = (a) => ({ ...real(a), materials: SHAS.map((sha) => ({ sha, held: "evidence" })) });
  const sig = await signCase(key, CASE, 1, docSha);
  return { w, docSha, sig, body: { caseId: CASE, edition: 1, expectedSha: docSha, sig } };
}

/* a plane whose every store call and bucket call waits and is recorded */
function timed(w) {
  const p = plane(w);
  const calls = [], bucket = [];
  let live = 0, peak = 0;
  const real = p.stub.fetch.bind(p.stub);
  p.stub.fetch = async (u, init) => {
    const op = new URL(u instanceof Request ? u.url : u).pathname.slice(1);
    const c = { op, start: performance.now(), end: null }; calls.push(c);
    await nap();
    try { return await real(u, init); } finally { c.end = performance.now(); }
  };
  const wrap = (b) => {
    const out = {};
    for (const k of ["head", "get", "put"]) out[k] = async (...a) => {
      live++; peak = Math.max(peak, live); bucket.push(k);
      try { await nap(); return await b[k](...a); } finally { live--; }
    };
    return out;
  };
  p.ctx.env.CAPTURES = wrap(p.ctx.env.CAPTURES);
  p.ctx.env.PUBLISHED = wrap(p.ctx.env.PUBLISHED);
  const phases = [];
  p.ctx.stateTiming = (name, ms) => phases.push([name, ms]);
  for (const s of SHAS) p.captures.set(`s/captures/${s}`, new TextEncoder().encode(`doc ${s}`));
  return { p, calls, bucket, phases, peak: () => peak };
}

const GOLDEN_KEYS = ["attestor", "caseId", "deliveredBy", "edition", "materials_copied", "next", "ok", "store", "tokenClass"];

test("R60: the material copy is concurrent (peak at least 6 over 12 materials), every material copied, the answer as before", async () => {
  const { w, body } = await setup();
  const t = timed(w);
  const res = await caseRatifyOp(t.p.request(body), t.p.stub, t.p.ctx);
  assert.deepEqual([res.status, res.body.ok], [200, true], JSON.stringify(res.body).slice(0, 300));
  assert.deepEqual(res.body.materials_copied, { copied: 12, present: 0, missing: [] });
  assert.ok(t.peak() >= 6, `peak concurrency of the bucket calls is ${t.peak()}`);
  assert.ok(t.peak() <= 8, `groups of 8: peak ${t.peak()}`);
  for (const s of SHAS) assert.ok(t.p.published.has(`s/published/${s}`), "copied by its SHA-256");
  assert.deepEqual(Object.keys(res.body).sort().filter((k) => GOLDEN_KEYS.includes(k)), GOLDEN_KEYS.filter((k) => k in res.body).sort());
  assert.equal("evidenceMaterials" in res.body, false);
});

test("R60 (control): one material is copied with peak 1, and a missing, a present and a failing one are counted in item order as before", async () => {
  const live = { n: 0, peak: 0 };
  const caps = new Map(), pub = new Map();
  const slow = (b) => ({ ...b, head: async (k) => { live.n++; live.peak = Math.max(live.peak, live.n); await nap(); live.n--; return b.head(k); } });
  const A = "aa".repeat(32), B = "bb".repeat(32), C = "cc".repeat(32), D = "dd".repeat(32);
  pub.set(`s/published/${A}`, new Uint8Array([1]));
  caps.set(`s/captures/${C}`, new Uint8Array([3])); caps.set(`s/captures/${D}`, new Uint8Array([4]));
  const env = { CAPTURES: bucketOver(caps), PUBLISHED: slow(bucketOver(pub)) };
  const one = await copyMaterialsDetailed(env, "s", [A]);
  assert.deepEqual(one, { copied: 0, present: 1, missing: [], absent: [] });
  assert.equal(live.peak, 1, "one item, peak 1");
  const real = env.PUBLISHED.put;
  env.PUBLISHED.put = async (k, ...r) => { if (k.endsWith(D)) throw new Error("refused"); return real(k, ...r); };
  const out = await copyMaterialsDetailed(env, "s", [A, B, C, D]);
  assert.deepEqual(out, { copied: 1, present: 1, missing: [B, D], absent: [B] });
  assert.ok(live.peak >= 3, "four items run together");
});

test("R60: casetestimony, caseapproval and casegate are issued together after casedocfacts", async () => {
  const { w, body } = await setup();
  const t = timed(w);
  const res = await caseRatifyOp(t.p.request(body), t.p.stub, t.p.ctx);
  assert.equal(res.body.ok, true);
  const by = Object.fromEntries(t.calls.map((c) => [c.op, c]));
  const three = [by.casetestimony, by.caseapproval, by.casegate];
  assert.ok(three.every(Boolean));
  assert.ok(Math.max(...three.map((c) => c.start)) < Math.min(...three.map((c) => c.end)), "all three in flight at once");
  assert.ok(Math.min(...three.map((c) => c.start)) >= by.casedocfacts.end, "after the facts they depend on");
});

test("R60 (control): the refusals keep their order though the reads are together: testimony before stale before approval before the signature", async () => {
  const { w, body, docSha } = await setup();
  const t = timed(w);
  const stale = await caseRatifyOp(t.p.request({ ...body, expectedSha: "0".repeat(64), sig: "not a signature" }), t.p.stub, t.p.ctx);
  assert.deepEqual([stale.status, stale.body.reason], [409, "CASE_RATIFY_STALE"]);
  const t2 = timed(w);
  const bad = await caseRatifyOp(t2.p.request({ ...body, sig: "not a signature" }), t2.p.stub, t2.p.ctx);
  assert.match(bad.body.reason, /^SIG_/);
  assert.equal(w.pub.committed.length, 0, "nothing committed by a refused act");
  assert.ok(docSha);
});

test("R60: the phases gate, commit, copy, assemble and reuse are stated once each, in order, as milliseconds", async () => {
  const { w, body } = await setup();
  const t = timed(w);
  await caseRatifyOp(t.p.request(body), t.p.stub, t.p.ctx);
  assert.deepEqual(t.phases.map(([n]) => n), ["gate", "commit", "copy", "assemble", "reuse"]);
  for (const [, ms] of t.phases) assert.ok(Number.isFinite(ms) && ms >= 0);
  const bare = timed(w);
  delete bare.p.ctx.stateTiming;
  const res = await caseRatifyOp(bare.p.request(body), bare.p.stub, bare.p.ctx);
  assert.equal(res.status === 200 || res.body.existed, true, "no hook, no change to the act");
});

test("R60: copyFinding copies a finding's parts in groups of 8 (peak at least 6, at most 8), counting as one at a time did; a capture gone between gate and copy is stated INCOMPLETE", async () => {
  const { copyFinding } = await import("../../../src/ratification/finding.mjs");
  const caps = new Map(), pub = new Map();
  let live = 0, peak = 0;
  const slow = (b) => Object.fromEntries(["head", "get", "put"].map((k) => [k, async (...a) => { live++; peak = Math.max(peak, live); try { await nap(); return await b[k](...a); } finally { live--; } }]));
  const env = { CAPTURES: slow(bucketOver(caps)), PUBLISHED: slow(bucketOver(pub)) };
  const texts = SHAS.slice(0, 8).map((sha, i) => ({ sha256: sha, path: `f${i}`, kind: "file", bytes: 3, text: `t${i}` }));
  const blobs = SHAS.slice(8).map((sha, i) => ({ sha256: sha, path: `c${i}`, kind: "capture", bytes: 3 }));
  for (const b of blobs) caps.set(`s/captures/${b.sha256}`, new Uint8Array([1]));
  pub.set(`s/published/${SHAS[0]}`, new Uint8Array([9]));
  const out = await copyFinding(env, "s", { shas: [...texts, ...blobs], partShaSet: new Set(), partedRows: new Map() });
  assert.deepEqual([out.copied, out.present, out.r2state], [11, 1, "ok"]);
  assert.ok(peak >= 6 && peak <= 8, `peak ${peak}`);
  for (const x of [...texts, ...blobs]) assert.ok(pub.has(`s/published/${x.sha256}`));
  caps.delete(`s/captures/${blobs[0].sha256}`); pub.delete(`s/published/${blobs[0].sha256}`);
  const gone = await copyFinding(env, "s", { shas: [...texts, ...blobs], partShaSet: new Set(), partedRows: new Map() });
  assert.match(gone.r2state, /^INCOMPLETE: capture vanished/);
  assert.equal(gone.copied, 0);
  assert.equal(gone.present, 11);
});
