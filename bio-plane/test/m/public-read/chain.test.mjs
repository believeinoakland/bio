/* public-read R6 (fix round 10, cause 27a; K5083; RATIFICATION #36 J18 (2)): the case-file assembly makes at most three
   awaited hops in a row: its facts, its one group of bucket calls, its record. The chain is the longest run of calls each of
   which began after the one before it ended, counted by a logical sequence, never by time (R-CLOCK). Red at five before this
   fix; the controls are the container's bytes, the manifest and every refusal, unchanged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket } from "./fixture.mjs";
import { bindPublishedPlane, assembleCaseContainer } from "../../../src/publication/worker.mjs";

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const CHAIN_BAR = 3;
const nap = () => new Promise((r) => setTimeout(r, 2));
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

/* a complete edition over F resting on DOC, signed, held in a bucket whose calls are logged (`counted`) */
function scene() {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const sha = w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, DOC).capture_sha;
  w.prepare(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }],
                       materials: [{ ref: DOC, kind: "document", sha, text_sha: null, origin: null, archived_copy: null,
                                     included: true, rests_under: "load_bearing" }] });
  if (w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] }).ok !== true) throw new Error("fixture: the case did not sign");
  if (w.signFinding(F).ok !== true) throw new Error("fixture: the finding did not sign");
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  env.PUBLISHED.m.set(`bio/published/${sha}`, new TextEncoder().encode(`the text of ${DOC}`));
  return { w, env, cs: w.p.caseEditionState(CASE, 1, "parks-group") };
}

/* every store call and every bucket call, each with a logical start and end, in one sequence */
function counted({ w, env }) {
  const calls = [];
  let seq = 0;
  const logged = async (name, fn) => {
    const c = { name, start: seq++, end: null };
    calls.push(c);
    await nap();
    try { return await fn(); } finally { c.end = seq++; }
  };
  const stub = stubOf(w);
  const real = stub.fetch.bind(stub);
  const counted = { fetch: (u, init) => logged("do:" + new URL(u instanceof Request ? u.url : u).pathname.slice(1), () => real(u, init)) };
  const b = env.PUBLISHED;
  const bucketCounted = { get: (...a) => logged("bucket.get", () => b.get(...a)), head: (...a) => logged("bucket.head", () => b.head(...a)),
                          put: (...a) => logged("bucket.put", () => b.put(...a)) };
  return { calls, stub: counted, env: { PUBLISHED: bucketCounted } };
}

/* the longest run of calls each beginning after the one before it ended */
function chainOf(calls) {
  const depth = new Map();
  const order = [...calls].sort((a, b) => a.start - b.start);
  for (const c of order) depth.set(c, 1 + Math.max(0, ...order.filter((d) => d.end !== null && d.end < c.start).map((d) => depth.get(d) ?? 0)));
  return Math.max(0, ...depth.values());
}

test("R6 (cause 27a, K5083): the case-file assembly of a complete edition is a chain of at most 3 awaited hops: its facts, its group of bucket calls, its record (red: 5)", async () => {
  const s = scene();
  const t = counted(s);
  const out = await assembleCaseContainer({ env: t.env, stub: t.stub, storeName: "bio", cs: s.cs, via: "test" });
  assert.equal(out.case_file, "built", JSON.stringify(out).slice(0, 300));
  const chain = chainOf(t.calls);
  if (process.env.CHAIN_DEBUG) console.log(t.calls.map((c) => `${c.name}[${c.start}-${c.end}]`).join(" "));
  assert.ok(chain <= CHAIN_BAR, `the longest chain is ${chain} (bar ${CHAIN_BAR}): ${t.calls.map((c) => c.name).join(" ")}`);
});
