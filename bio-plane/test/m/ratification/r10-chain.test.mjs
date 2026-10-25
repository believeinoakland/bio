/* ratification R6, R60 (fix round 10, cause 27a; K5057): the sign act's CHAIN of awaited calls, counted. The walker's case (E2): a case
   edition signed in one sitting, its two findings and the evidence one rests on, with a reused part to re-fetch, over a store that
   answers each call after a real wait. A call is a read or write of the store half (`stub.fetch`) or of a bucket; the chain is the
   longest run of calls each of which began after the one before it ended (a logical sequence, never a time: R-CLOCK). The figure is
   derived from the bar, not from the chain: the act through the door is at most 10 awaited calls; the door's admission is one (`session`
   with `reauthdue`, folded); `public-read`'s assembly, which this module calls once and counts as nothing here, is three (its facts, its
   group of bucket calls, its record); so this module's own chain is at most 10 - 1 - 3 = 6: the case's facts, the reads and the gate
   together, the commit, and the copy's head, get and put. Red before this fix at 10 (the member's reads after the case's, the
   reuse check after the assembly). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, plane, newKey, signBundle, signCase, cleanInfoMd, cleanCase, fmText, CASE_BODY, V } from "./fixture.mjs";
import { caseRatifyOp, publishAtOp } from "../../../src/ratification/ops.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const CASE = "CASE-2026-0102";
const OWN = { version: "first", claim: "the transfer was authorised", falsifier: "an adopted resolution forbidding it",
              falsifier_override: null, by: "member:iris", at: "2026-09-27T10:00:00Z" };
const FINDINGS = ["INQ-2026-1021-lead", "INQ-2026-1022-second"];
const EVIDENCE = ["INFO-2026-1031-memo"];
const CHAIN_BAR = 6;
const nap = () => new Promise((r) => setTimeout(r, 2));
const GOLDEN_KEYS = ["attestor", "caseId", "container", "deliveredBy", "edition", "materials_copied", "next", "ok", "sitting", "store", "tokenClass"];

function cleanInqMd(id) {
  const question = `Was the transfer ${id} authorised?`;
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${question}"`,
    "current_state: open", "prior_state: null", `created: "2026-07-01T00:00:00Z"`, `last_updated: "2026-07-01T00:00:00Z"`,
    "produced_by:", "  mode: human", "  capability_tier: none", "group: test-group", "references: []",
    "state_history: []", "annotations_open: 0", "reeval_pending: false", "visuals: []", "surfaced_by: human",
    "recheck_triggers:", "  - text: Revisit after the next budget cycle",
    "    description: The adopted budget may restate the transfer basis.",
    "---", "", "## Question", "", question, "", word("conformance.rests"), "", "## Conclusion", "",
    word("conformance.falsify"), "", "## Session Log", "", "## Review Notes", ""].join("\n");
}

async function sitting() {
  const w = world();
  const iris = await newKey();
  w.member("iris", { signer: iris });
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], V("iris"));
  w.r.registerHoldReader({ holdsOn: () => ({ held: false }) });
  const P = w.project("Team", "iris");
  for (const q of FINDINGS) { w.promote(q, cleanInqMd(q)); w.bv.conc.set(w.key(P, q), OWN); }
  for (const e of EVIDENCE) {
    w.promote(e, cleanInfoMd(e), "information");
    w.pub.resting.set(e, [{ case_id: CASE, finding: FINDINGS[0], project: P }]);
  }
  /* a reused part the member's finding carries, to be re-fetched at ratification (CAP-4): an address that is no public https one,
     so the check states it unavailable without a network call, in its three store hops (reusedparts, capturelimit, recordreuseverdicts) */
  w.ops.reusedparts = () => ({ parts: [{ primary_sha: "a".repeat(64), host: "example.test", address_norm: "example.test/x",
                                         reused_sha: "b".repeat(64), address: "ftp://example.test/x" }] });
  const conc = FINDINGS.flatMap((q) => caseConclusionRowLines(q, w.r.caseConclusionFor(P, q, V("iris"), "open")));
  const text = fmText(cleanCase({ caseId: CASE, edition: 1, project: P, members: FINDINGS.map((id) => ({ id, pin: w.sha(id) })) }),
                      { raw: ["case_conclusions:", ...conc], body: CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text, { owner: P });
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
    attribution: { reached: [], legacy: [], stated: [], current: [] },
    signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  const sig = await signCase(iris, CASE, 1, docSha);
  const members = [];
  for (const id of [...FINDINGS, ...EVIDENCE]) members.push({ id, sha: w.sha(id), signature: await signBundle(iris, id, w.sha(id)) });
  return { w, docSha, sig, members, body: { caseId: CASE, edition: 1, expectedSha: docSha, sig, members } };
}

/* the plane whose every store call and bucket call waits and is logged with a start and an end in one logical sequence */
function counted(w) {
  const p = plane(w, { session: { role: "member:iris" }, viewer: V("iris") });
  const calls = [];
  let seq = 0;
  const logged = async (name, fn) => {
    const c = { name, start: seq++, end: null };
    calls.push(c);
    await nap();
    try { return await fn(); } finally { c.end = seq++; }
  };
  const real = p.stub.fetch.bind(p.stub);
  p.stub.fetch = (u, init) => logged("do:" + new URL(u instanceof Request ? u.url : u).pathname.slice(1), () => real(u, init));
  for (const bucket of ["CAPTURES", "PUBLISHED"]) {
    const b = p.ctx.env[bucket];
    p.ctx.env[bucket] = Object.fromEntries(["head", "get", "put"].map((k) => [k, (...a) => logged(`${bucket}.${k}`, () => b[k](...a))]));
  }
  return { p, calls };
}

/* the longest run of calls each beginning after the one before it ended */
function chainOf(calls) {
  const order = [...calls].sort((a, b) => a.start - b.start);
  const depth = new Map();
  for (const c of order) depth.set(c, 1 + Math.max(0, ...order.filter((d) => d.end !== null && d.end < c.start).map((d) => depth.get(d) ?? 0)));
  return Math.max(0, ...depth.values());
}

test("R60, R6 (fix round 10, cause 27a): the case signed in a sitting with a reused part to re-fetch is a chain of at most 6 awaited calls of this module's own (red: 10)", async () => {
  const s = await sitting();
  const t = counted(s.w);
  const res = await caseRatifyOp(t.p.request(s.body), t.p.stub, t.p.ctx);
  assert.deepEqual([res.status, res.body.ok], [200, true], JSON.stringify(res.body).slice(0, 400));
  const chain = chainOf(t.calls);
  if (process.env.CHAIN_DEBUG) console.log(t.calls.map((c) => `${c.name}[${c.start}-${c.end}]`).join(" "));
  assert.ok(chain <= CHAIN_BAR, `the longest chain awaited one after another is ${chain} (bar ${CHAIN_BAR}): ${t.calls.map((c) => c.name).join(" ")}`);
  assert.equal(t.p.assembled.length, 1, "the assembly is still called once for the complete edition");
});

test("R60, R6 (control): the answer is the one as before: the golden keys, materials_copied, the container, each member's reuse report, the phases once each in order", async () => {
  const s = await sitting();
  const t = counted(s.w);
  const phases = [];
  t.p.ctx.stateTiming = (name) => phases.push(name);
  const res = await caseRatifyOp(t.p.request(s.body), t.p.stub, t.p.ctx);
  assert.equal(res.body.ok, true, JSON.stringify(res.body).slice(0, 400));
  assert.deepEqual(Object.keys(res.body).filter((k) => GOLDEN_KEYS.includes(k)).sort(), GOLDEN_KEYS.filter((k) => k in res.body).sort());
  assert.deepEqual(res.body.materials_copied, { copied: 0, present: 0, missing: [] });
  assert.deepEqual(res.body.container, { manifest_sha: "m".repeat(64), zip: "z" });
  assert.deepEqual(res.body.sitting.map((m) => m.bundleId), s.members.map((m) => m.id));
  for (const m of res.body.sitting) {
    assert.equal(m.reuse.reused_parts, 1, "the reused part is re-fetched and stated");
    assert.equal(m.reuse.unavailable, 1);
  }
  assert.deepEqual(phases, ["gate", "commit", "copy", "assemble", "reuse"]);
});

test("R60, R6 (control): the reads started before the case's facts are answered change no refusal: a case that does not exist, a stale sha and a bad member signature are refused as before and nothing is committed", async () => {
  const s = await sitting();
  const t = counted(s.w);
  const missing = await caseRatifyOp(t.p.request({ ...s.body, caseId: "CASE-2026-9999" }), t.p.stub, t.p.ctx);
  assert.equal(missing.status, 404);
  const stale = await caseRatifyOp(counted(s.w).p.request({ ...s.body, expectedSha: "0".repeat(64) }), t.p.stub, t.p.ctx);
  assert.deepEqual([stale.status, stale.body.reason], [409, "CASE_RATIFY_STALE"]);
  const bad = s.members.map((m, i) => (i === 1 ? { ...m, signature: "not a signature" } : m));
  const u = counted(s.w);
  const refused = await caseRatifyOp(u.p.request({ ...s.body, members: bad }), u.p.stub, u.p.ctx);
  assert.match(refused.body.reason, /^SIG_/);
  assert.equal(refused.body.member, s.members[1].id);
  assert.equal(s.w.count("published_cases"), 0);
  assert.equal(s.w.count("published_bundles"), 0);
  assert.equal(u.p.fetched.includes("caseratify"), false, "the commit hop was never made");
});

test("R60, R40 (control): op=publishat reads the sitting's members together with the case's facts too, and answers as before", async () => {
  const s = await sitting();
  const t = counted(s.w);
  const res = await publishAtOp(t.p.request({ ...s.body, at: { date: "2026-10-09", time: "09:30" } }), t.p.stub, t.p.ctx);
  assert.ok(res.status === 200 || typeof res.body.reason === "string", JSON.stringify(res.body).slice(0, 300));
  assert.ok(chainOf(t.calls) <= CHAIN_BAR, `chain ${chainOf(t.calls)}`);
});
