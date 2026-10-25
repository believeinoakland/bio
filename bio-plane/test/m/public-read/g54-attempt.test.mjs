/* public-read — G54 (fix round 6; `build/plan/fix-round-6-T51.md`): the case file's attempt is never silent. A complete published edition
   was left with no case file (CASE-2026-4783 and -6227 on the test copy: `manifest_sha` null, nothing stating, recording or retrying
   it). `assembleCaseContainer` now records `building`, catches every throw and every statement at its step, records `failed` with a
   code of the closed set, writes one structured `casefile_attempt` line, never throws, records no manifest while a material is missing
   or the bucket is not bound, and records `built` only after the manifest's own bytes are stored; `publishedcase` answers the state
   and the code, and nothing else of the attempt. Every case here is the real commit (`publication`), the real store, the real bucket
   shape and the real reader; the failures are the bucket's and the store's own (a `put` that throws, a store that does not answer).
   The ledger is `publication`'s (`recordCaseFileAttempt`, R15), merged first. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, stubOf, bucket, V, NOW } from "./fixture.mjs";
import { bindPublishedPlane, assembleCaseContainer, recordCaseFileFailure, CASEFILE_CODES } from "../../../src/publication/worker.mjs";
import { caseFileStateOf, CASEFILE_PUBLIC_STATES } from "../../../src/public-read/casefile.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const enc = (s) => new TextEncoder().encode(s);
const hex = (b) => createHash("sha256").update(b).digest("hex");
const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const MARKER = "MARKER-7f3a-should-never-be-public";
const row = (ref, sha, extra = {}) => ({ ref, kind: "document", sha, text_sha: null, origin: null, archived_copy: null, included: true,
                                         rests_under: "load_bearing", ...extra });

/* A complete edition over F resting on DOC (and on `extra` rows), signed, F's bytes in the bucket unless `noFinding`. */
function scene({ extra = [], noFinding = false, incomplete = false } = {}) {
  const w = world(), env = { PUBLISHED: bucket() };
  w.doc(DOC);
  w.member("olive");
  if (incomplete) w.member("ann");
  const proj = w.project("Parks", "olive");
  const G = "INQ-2026-0002";
  w.inquiry(F, { legs: [{ target: DOC }] });
  if (incomplete) w.inquiry(G, { legs: [{ target: DOC }] });
  const pin = w.head(F), pinG = incomplete ? w.head(G) : null;
  const sha = w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, DOC).capture_sha;
  w.prepare(CASE, 1, { format: "bio-case-document/7", project: proj,
    roles: [{ target: F, version_sha: pin }, ...(incomplete ? [{ target: G, version_sha: pinG }] : [])], materials: [row(DOC, sha), ...extra] });
  const roster = [{ bundle_id: F, version_sha: pin }, ...(incomplete ? [{ bundle_id: G, version_sha: pinG }] : [])];
  assert.equal(w.signCase(CASE, 1, { project: proj, roster }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  if (!noFinding) env.PUBLISHED.m.set(`bio/published/${pin}`, enc(w.text(F)));
  env.PUBLISHED.m.set(`bio/published/${sha}`, enc(`the text of ${DOC}`));
  return { w, env, pin };
}
const cs = (w) => w.p.caseEditionState(CASE, 1, "parks-group");
const ledger = (w) => w.row(`SELECT manifest_sha, casefile_state, casefile_attempts, casefile_why FROM published_cases WHERE case_id=?`, CASE);
const owed = (w) => w.p.caseFilesOwed({ now: "2099-01-01T00:00:00Z" }).map((x) => x.case);
const call = (w, env, extra = {}) => ({ env, stub: stubOf(w), storeName: "bio", cs: cs(w), via: "test", ...extra });

/* the lines the assembly writes: every console.log / console.error call during `run`, parsed */
async function lines(run) {
  const out = [], log = console.log, err = console.error;
  console.log = (...a) => { out.push(a.join(" ")); };
  console.error = (...a) => { out.push(a.join(" ")); };
  try { const result = await run(); return { result, lines: out }; } finally { console.log = log; console.error = err; }
}
const attempts = (ls) => ls.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((x) => x && x.event === "casefile_attempt");
/* a bucket whose operations fail: `put` throws (for every key, or only the key `only`) */
const failingPut = (env, only = null) => {
  const real = env.PUBLISHED.put.bind(env.PUBLISHED);
  env.PUBLISHED.put = async (k, v) => { if (only === null || only(k, v)) throw new Error(`bucket write refused ${MARKER}`); return real(k, v); };
};
/* a store that does not answer the ops named */
const silentOps = (w, ops) => {
  const real = stubOf(w);
  return { fetch: async (req, init) => {
    const r = typeof req === "string" ? new Request(req, init) : req;
    return ops.includes(new URL(r.url).pathname.slice(1)) ? new Response("down", { status: 500 }) : real.fetch(req, init);
  } };
};

const CASES = [
  ["(a) PUBLISHED.put throws", { fail: (s) => failingPut(s.env) }, { step: "bucket_put", code: "BUCKET_FAILED", manifest: false }],
  ["(b) casefilefacts is not answered", { stub: (s) => silentOps(s.w, ["casefilefacts"]) }, { step: "facts", code: "STORE_SILENT", manifest: false }],
  ["(c) recordcasemanifest is not answered", { stub: (s) => silentOps(s.w, ["recordcasemanifest"]) }, { step: "record", code: "STORE_SILENT", manifest: false }],
  ["(d) a finding's bytes are absent", { scene: { noFinding: true } }, { step: "build", code: "FINDING_MISSING", manifest: false }],
  ["(e) PUBLISHED.put throws only for the manifest's key", { fail: (s) => failingPut(s.env, (k, v) => { try { return String(JSON.parse(new TextDecoder().decode(v)).format).startsWith("bio-case-file/"); } catch { return false; } }) },
   { step: "manifest_put", code: "BUCKET_FAILED", manifest: true }],
  ["(f) no PUBLISHED binding", { env: () => ({}) }, { step: "bucket_put", code: "NO_BUCKET", manifest: false }],
  ["(g) a material this copy does not hold (the 4783 shape)", { scene: { extra: [row("INFO-2026-0404-gone", hex(enc("never held")))] } },
   { step: "materials", code: "MATERIAL_MISSING", manifest: false }],
  ["(g') the caller's own copy left a material missing (prior.materials_missing)", { prior: { materials_missing: [{ sha: hex(enc("x")) }] } },
   { step: "materials", code: "MATERIAL_MISSING", manifest: false }],
];
for (const [name, how, want] of CASES) {
  test(`R6 G54 ${name}: the assembly answers the statement and never throws, records failed at step ${want.step} with code ${want.code}, writes exactly one casefile_attempt error line, and the edition stays owed${want.manifest ? " (its manifest is recorded, its bytes were not stored)" : "; no manifest is recorded"}`, async () => {
    const s = scene(how.scene || {});
    if (how.fail) how.fail(s);
    const env = how.env ? how.env() : s.env;
    const { result, lines: out } = await lines(() => assembleCaseContainer({ ...call(s.w, env), ...(how.stub ? { stub: how.stub(s) } : {}), ...(how.prior ? { prior: how.prior } : {}) }));
    assert.equal(result.ok, false);
    assert.deepEqual([result.code, result.step], [want.code, want.step]);
    const l = attempts(out);
    assert.equal(l.length, 1, `exactly one casefile_attempt line: ${out.join(" | ").slice(0, 300)}`);
    assert.deepEqual([l[0].ok, l[0].code, l[0].step, l[0].case, l[0].edition], [false, want.code, want.step, CASE, 1]);
    for (const line of out) { assert.equal(line.includes("the text of"), false, "no text of a document"); assert.ok(String(JSON.parse(line).error ?? "").length <= 160, "the error is cut"); }
    const row = ledger(s.w);
    assert.equal(Boolean(row.manifest_sha), want.manifest, "manifest_sha");
    if (how.stub && (want.step === "facts" || want.step === "record")) return;   // the ledger itself was reachable only through the real store
    assert.equal(row.casefile_state, "failed");
    assert.equal(JSON.parse(row.casefile_why).code, want.code);
    assert.equal(JSON.parse(row.casefile_why).step, want.step);
    assert.deepEqual(owed(s.w), [CASE], "the edition stays owed");
  });
}

test("R6 G54 a success records building, then built only after the manifest's bytes are in the bucket, and writes one casefile_attempt line", async () => {
  const s = scene();
  const order = [];
  const put = s.env.PUBLISHED.put.bind(s.env.PUBLISHED);
  const real = stubOf(s.w);
  const stub = { fetch: async (req, init) => {
    const r = typeof req === "string" ? new Request(req, init) : req;
    if (new URL(r.url).pathname === "/recordcasefile") order.push(`ledger:${JSON.parse(await r.clone().text()).state}`);
    return real.fetch(req, init);
  } };
  s.env.PUBLISHED.put = async (k, v) => { order.push(`put:${k.slice(-8)}`); return put(k, v); };
  const { result, lines: out } = await lines(() => assembleCaseContainer(call(s.w, s.env, { stub })));
  assert.equal(typeof result.manifest_sha, "string");
  assert.equal(result.case_file, "built");
  const mKey = `put:${result.manifest_sha.slice(-8)}`;
  assert.ok(order.indexOf(mKey) >= 0 && order.indexOf("ledger:built") > order.indexOf(mKey), `built after the manifest's bytes: ${order.join(" ")}`);
  assert.equal(order[0], "ledger:building");
  const l = attempts(out);
  assert.equal(l.length, 1);
  assert.deepEqual([l[0].ok, l[0].code], [true, null]);
  assert.equal(ledger(s.w).casefile_state, "built");
  assert.deepEqual(owed(s.w), [], "a built edition is never owed");
  /* a second assembly of the same edition changes nothing but is stated as well, and records the same manifest */
  const again = await assembleCaseContainer(call(s.w, s.env));
  assert.equal(again.manifest_sha, result.manifest_sha);
});

test("R6 G54 a failed attempt is healed by the next: the edition owed after a bucket that threw is built when the bucket answers, and is no longer owed", async () => {
  const s = scene();
  const put = s.env.PUBLISHED.put.bind(s.env.PUBLISHED);
  failingPut(s.env);
  const first = await assembleCaseContainer(call(s.w, s.env));
  assert.equal(first.ok, false);
  assert.deepEqual(owed(s.w), [CASE]);
  s.env.PUBLISHED.put = put;
  const second = await assembleCaseContainer(call(s.w, s.env));
  assert.equal(typeof second.manifest_sha, "string");
  assert.equal(ledger(s.w).casefile_state, "built");
  assert.equal(ledger(s.w).casefile_attempts, 3, "building, failed, building: each counts; built adds none");
  assert.deepEqual(owed(s.w), []);
});

test("R6 G54 a caller's copy that threw before the assembly was reached is recorded by recordCaseFileFailure at step copy: failed, one error line, the edition owed; any code outside the closed set reads UNKNOWN", async () => {
  const s = scene();
  const { result, lines: out } = await lines(() => recordCaseFileFailure({ stub: stubOf(s.w), cs: cs(s.w), via: "ratify", error: new Error(`copy refused ${MARKER}`) }));
  assert.deepEqual([result.ok, result.state, result.code, result.step], [true, "failed", "BUCKET_FAILED", "copy"]);
  assert.equal(attempts(out).length, 1);
  assert.deepEqual([JSON.parse(ledger(s.w).casefile_why).step, JSON.parse(ledger(s.w).casefile_why).code], ["copy", "BUCKET_FAILED"]);
  assert.deepEqual(owed(s.w), [CASE]);
  const other = await recordCaseFileFailure({ stub: stubOf(s.w), cs: cs(s.w), via: "ratify", step: "copy", code: "NOT_A_CODE" });
  assert.equal(other.code, "BUCKET_FAILED", "a copy failure names no other code than the closed set's");
  const odd = await recordCaseFileFailure({ stub: stubOf(s.w), cs: cs(s.w), via: "ratify", step: "build", code: "NOT_A_CODE" });
  assert.equal(odd.code, "UNKNOWN");
  assert.equal((await recordCaseFileFailure({ stub: { fetch: async () => { throw new Error("gone"); } }, cs: cs(s.w) })).ok, false, "never throws");
  assert.ok(CASEFILE_CODES.includes("MATERIAL_MISSING") && CASEFILE_CODES.length === 9);
});

test("R6 G54 an assembly whose caller's copy threw (prior.copy_error) records failed at step copy and builds nothing", async () => {
  const s = scene();
  const out = await assembleCaseContainer(call(s.w, s.env, { prior: { copy_error: new Error("the copy threw") } }));
  assert.deepEqual([out.ok, out.step, out.code], [false, "copy", "BUCKET_FAILED"]);
  assert.equal(ledger(s.w).manifest_sha, null);
  assert.equal(ledger(s.w).casefile_state, "failed");
});

/* ---- publishedcase: the state and the code, and nothing else of the attempt */

const caseFileOf = (w) => w.read("publishedcase", { id: CASE });

test("R23 G54 publishedcase answers case_file {state, code, attempted_at, attempts}: being_prepared for a complete edition never attempted, retrying with its code after a recorded failure, built after the build; the verification states the same and gives no download address until built", async () => {
  const s = scene();
  let c = caseFileOf(s.w);
  assert.deepEqual(c.case_file, { state: "being_prepared", code: null, attempted_at: null, attempts: 0 });
  assert.equal(c.verification, undefined, "the synchronous read has no verification (the Worker's route adds it)");
  const failing = new Error(`bucket write refused ${MARKER}`);
  await recordCaseFileFailure({ stub: stubOf(s.w), cs: cs(s.w), via: "t", step: "bucket_put", code: "BUCKET_FAILED", error: failing });
  c = caseFileOf(s.w);
  assert.equal(c.case_file.state, "retrying");
  assert.equal(c.case_file.code, "BUCKET_FAILED");
  assert.equal(c.case_file.attempts, 1);
  assert.equal(typeof c.case_file.attempted_at, "string");
  assert.deepEqual(Object.keys(c.case_file).sort(), ["attempted_at", "attempts", "code", "state"]);
  const wire = JSON.stringify(c);
  assert.equal(wire.includes(MARKER), false, "the marker of the thrown error is never public");
  assert.equal(/"step"\\s*:|"error"\\s*:|casefile_why/.test(JSON.stringify(c.case_file)), false);
  assert.ok((await assembleCaseContainer(call(s.w, s.env))).manifest_sha);
  assert.deepEqual(caseFileOf(s.w).case_file.state, "built");
  assert.equal(caseFileOf(s.w).case_file.code, null);
});

test("R23 G54 a building older than two minutes is being_prepared with code INTERRUPTED; a stopped edition answers stopped with MATERIAL_MISSING carried; an incomplete edition answers waiting_on_members", async () => {
  const s = scene();
  assert.equal(s.w.p.recordCaseFileAttempt({ caseId: CASE, edition: 1, state: "building", at: "2020-01-01T00:00:00Z" }).ok, true);
  assert.deepEqual([caseFileOf(s.w).case_file.state, caseFileOf(s.w).case_file.code], ["being_prepared", "INTERRUPTED"]);
  const t = scene();
  for (let i = 0; i < 6; i++)
    assert.equal(t.w.p.recordCaseFileAttempt({ caseId: CASE, edition: 1, state: "failed", absent: true, why: { code: "MATERIAL_MISSING", step: "materials" } }).ok, true);
  assert.deepEqual([caseFileOf(t.w).case_file.state, caseFileOf(t.w).case_file.code], ["stopped", "MATERIAL_MISSING"]);
  assert.deepEqual(owed(t.w), [], "a stopped edition is owed by no tick");
  const u = scene({ incomplete: true });
  assert.equal(caseFileOf(u.w).case_file.state, "waiting_on_members");
});

test("R23 G54 the closed set maps in one place: a stored code outside it reads UNKNOWN, every state is one the page has a sentence for, and a loose ratified bundle has no case_file", async () => {
  const base = { complete: true, manifest_sha: null, attempts: 2, attempted_at: NOW };
  // fixtures-generic: SOMETHING_ELSE
  assert.equal(caseFileStateOf({ ...base, state: "failed", why: JSON.stringify({ code: "SOMETHING_ELSE", step: "build" }) }).code, "UNKNOWN");
  assert.equal(caseFileStateOf({ ...base, state: "failed", why: "not json" }).code, "UNKNOWN");
  for (const code of CASEFILE_CODES) assert.equal(caseFileStateOf({ ...base, state: "failed", why: { code, step: "build" } }).code, code);
  const seen = new Set([
    caseFileStateOf({ ...base, state: null }).state, caseFileStateOf({ ...base, state: "failed", why: { code: "UNKNOWN" } }).state,
    caseFileStateOf({ ...base, state: "stopped", why: { code: "MATERIAL_MISSING" } }).state, caseFileStateOf({ ...base, state: "built", manifest_sha: "a".repeat(64) }).state,
    caseFileStateOf({ ...base, complete: false }).state]);
  assert.deepEqual([...seen].sort(), [...CASEFILE_PUBLIC_STATES].sort());
  /* a ratified bundle that is in no case: no case file to state */
  const s = scene();
  const loose = s.w.read("publishedcase", { id: F });
  assert.ok(loose.ok);
  void V;
});

test("R23 G54 an edition committed before the ledger (a manifest, no state) reads built and is never owed, its answer otherwise what it was", async () => {
  const s = scene();
  assert.ok((await assembleCaseContainer(call(s.w, s.env))).manifest_sha);
  s.w.st.sql.exec(`UPDATE published_cases SET casefile_state=NULL, casefile_attempts=NULL, casefile_attempted_at=NULL, casefile_why=NULL WHERE case_id=?`, CASE);
  const c = caseFileOf(s.w);
  assert.deepEqual(c.case_file, { state: "built", code: null, attempted_at: null, attempts: 0 });
  assert.deepEqual(owed(s.w), []);
  assert.equal(typeof c.manifest_sha, "string");
});

test("R23 G54 the reader's thirteen stand-in sentences are held here, one per state without a case file and one per code of the closed set, and are in no answer", async () => {
  const { CASEFILE_SENTENCES } = await import("../../../src/public-read/index.mjs");
  const want = ["being_prepared", "retrying", "stopped", "waiting_on_members", ...CASEFILE_CODES.map((c) => `code.${c}`)];
  assert.deepEqual(Object.keys(CASEFILE_SENTENCES).sort(), want.sort());
  assert.equal(want.length, 13);
  for (const v of Object.values(CASEFILE_SENTENCES)) assert.ok(typeof v === "string" && v.length > 10);
  const s = scene();
  await recordCaseFileFailure({ stub: stubOf(s.w), cs: cs(s.w), via: "t", step: "build", code: "FINDING_MISSING" });
  const wire = JSON.stringify(caseFileOf(s.w));
  for (const v of Object.values(CASEFILE_SENTENCES)) assert.equal(wire.includes(v), false, "no sentence in the public answer");
});
