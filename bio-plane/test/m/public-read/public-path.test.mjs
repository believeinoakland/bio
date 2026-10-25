/* public-read — the public read path's invariants, over every route and every answer their text names (T47-29; N954;
   deepening PUBLIC-READ #20's sample-shaped arms, no requirement changed):
   R10 and R14: every public route (the store's ops, the Worker's `publishedcase` and `publishedbytes`, the door's ops)
   answers a world holding working material exactly as the same world without it, byte for byte, and every unpublished
   hash answers exactly as a hash that never existed (its own spelling aside, where the answer echoes it);
   R11: no answer, document or row the module serves composes a case-level strength, walked over every answer that can
   carry a pair, the case file's manifest and files among them.
   Driven at the module's interface: its ops (`publicReadOps`), the Worker's routes and the door (`publicReadDoorOp`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, publishedSix } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { publicReadDoorOp, PUBLIC_READ_DOOR_OPS } from "../../../src/public-read/door.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
async function doAnswer(res) {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  return { answered: false, result: undefined };
}
const storeRefusal = (out, extra = {}) => json({ ...out.reply.body, ...extra }, out.reply.status);
const storeSilent = (op, correlation = undefined) =>
  json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op, detail: "the store did not answer", correlation }, 502);
// fixtures-contract: answer-envelope door-helpers
const requiredArgument = (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const HELPERS = { json, requiredArgument, storeSilent, storeRefusal, doAnswer };
bindPublishedPlane({ ...HELPERS, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent",
                     PUBLISHED_STORE: "bio" });

const CASE = "CASE-2026-0001", CASE2 = "CASE-2026-0002";
const F = "INQ-2026-0001", G = "INQ-2026-0009", DOC = "INFO-2026-0001-minutes";
const NEVER = "e".repeat(64);
const roster = (roles) => roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" }));

/* CASE edition 1 over F, signed and published, F's bytes in the bucket; DOC, a document F rests on, captured and never
   published. */
function published() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  const roles = [{ target: F, version_sha: pin }];
  w.prepare(CASE, 1, { project: proj, roles });
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: roster(roles) }).ok, true);
  assert.equal(w.signFinding(F, { edges: [{ to: DOC, kind: "cites", disclosure: "serve" }] }).ok, true);
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  const unpublished = [w.head(DOC), w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, DOC).capture_sha];
  for (const h of unpublished) assert.match(String(h), /^[0-9a-f]{64}$/);
  return { w, env, pin, proj, unpublished };
}
/* The same world gains working material: F edited past its pin, G an inquiry nobody published, CASE2 prepared over G and
   never signed, CASE edition 2 prepared and never signed. Answers the working hashes. */
function addWorking(s) {
  const { w, proj } = s;
  w.inquiry(F, { legs: [{ target: DOC }], question: "An edited question nobody published?" });
  w.inquiry(G, { legs: [{ target: DOC }] });
  w.prepare(CASE2, 1, { project: proj, roles: [{ target: G, version_sha: w.head(G) }] });
  w.prepare(CASE, 2, { project: proj, roles: [{ target: F, version_sha: w.head(F) }] });
  const docs = w.rows(`SELECT doc_sha FROM case_documents WHERE (case_id=? AND edition=2) OR case_id=?`, CASE, CASE2).map((r) => r.doc_sha);
  const added = [w.head(F), w.head(G), ...docs];
  assert.notEqual(w.head(F), s.pin, "F moved past its pin");
  for (const h of added) assert.match(String(h), /^[0-9a-f]{64}$/);
  return added;
}

/* Every public route, each with the queries that name what the world holds or does not: the store's ops, the Worker's
   two routes (raw bytes and the zip), and the door's own ops. Each answers `{status, body}`, the body as served. */
const store = async (s, op, q) => ({ status: 200, body: JSON.stringify(await s.w.read(op, q)) });
const worker = async (s, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  const r = await publishedRoutes({ op, url, env: s.env, stub: stubOf(s.w) });
  return { status: r.status, body: new TextDecoder().decode(await r.arrayBuffer()) };
};
const door = async (s, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  const r = await publicReadDoorOp(op, url, s.env, stubOf(s.w), HELPERS);
  return { status: r.status, body: new TextDecoder().decode(await r.arrayBuffer()) };
};
const ids = [CASE, CASE2, F, G, DOC, "NOPE"];
function routes(hashes) {
  const out = [];
  for (const h of hashes) {
    out.push([store, "verify", { sha256: h }], [store, "publishedcase", { sha256: h }],
             [worker, "publishedcase", { sha256: h }], [worker, "publishedbytes", { sha256: h }],
             [worker, "publishedbytes", { sha256: h, format: "zip" }], [door, "verify", { sha256: h }]);
  }
  for (const id of ids) {
    out.push([store, "publishedcase", { id }], [store, "publishedcase", { id, edition: 2 }],
             [store, "publishedcase", { id: F, caseId: id }], [store, "publishededitions", { id }],
             [store, "docketpublic", { case: id }], [store, "docketfeed", { case: id }],
             [worker, "publishedcase", { id }], [door, "docketpublic", { case: id }], [door, "docketfeed", { case: id }]);
  }
  out.push([store, "publishedlist", {}], [store, "publishedmanifest", {}], [store, "publicread", { name: "anything" }],
           [door, "publishedmanifest", {}], [door, "publicread", { name: "anything" }], [door, "credit", {}]);
  return out;
}

test("R10 R14 every public route answers a world holding working material exactly as it answered before the world held it, the same status and the same bytes: the store's ops, the Worker's publishedcase and publishedbytes (raw and zip) and the door's ops", async () => {
  const s = published();
  /* the working hashes are known only once made, so the route list is fixed first over every name and hash they will be */
  const before = new Map();
  const probe = published();
  const willBe = addWorking(probe);
  /* hashes are content-addressed, so the same edits made in this world give the same hashes, except the case documents,
     which name the world's project: those are asked after, below */
  const list = routes([...s.unpublished, ...willBe.slice(0, 2), s.pin, NEVER]);
  /* the routes the door serves itself are all asked */
  const asked = new Set(list.filter(([via]) => via === door).map(([, op]) => op));
  for (const op of PUBLIC_READ_DOOR_OPS.filter((o) => !["publishedcase", "publishedbytes"].includes(o)))
    assert.ok(asked.has(op), `the door's ${op} is asked`);
  for (const [via, op, q] of list) before.set(`${via.name} ${op} ${JSON.stringify(q)}`, await via(s, op, q));
  const added = addWorking(s);
  assert.deepEqual(added.slice(0, 2), willBe.slice(0, 2), "the edited finding and the new inquiry hash alike in both worlds");
  for (const [via, op, q] of list) {
    const k = `${via.name} ${op} ${JSON.stringify(q)}`;
    assert.deepEqual(await via(s, op, q), before.get(k), `${k}: answers as if no working material were there`);
  }
  /* the unsigned case documents' hashes answer every hash route as a never-existed hash did before them */
  for (const h of added.slice(2)) for (const [via, op, q] of routes([h])) {
    if (!Object.hasOwn(q, "sha256")) continue;
    const never = before.get(`${via.name} ${op} ${JSON.stringify({ ...q, sha256: NEVER })}`);
    const now = await via(s, op, q);
    assert.deepEqual({ status: now.status, body: now.body.split(h).join(NEVER) }, never, `${via.name} ${op} at an unsigned case document's hash`);
  }
});

test("R10 R14 every unpublished hash answers, on every route that takes a hash, exactly as a hash that never existed: the same status and the same bytes, its own spelling where the answer echoes it aside; a published hash is the control", async () => {
  const s = published();
  s.unpublished.push(...addWorking(s));
  const same = (x, h) => ({ status: x.status, body: x.body.split(h).join("<hash>") });
  for (const h of s.unpublished) {
    for (const [via, op, q] of routes([h])) {
      const never = routes([NEVER]).find(([v, o, qq]) => v === via && o === op && JSON.stringify(Object.keys(qq)) === JSON.stringify(Object.keys(q))
        && (qq.format ?? null) === (q.format ?? null) && Object.hasOwn(qq, "sha256"));
      if (!Object.hasOwn(q, "sha256")) continue;
      const a = same(await via(s, op, q), h), b = same(await via(s, never[1], never[2]), NEVER);
      assert.deepEqual(a, b, `${via.name} ${op} ${JSON.stringify(q)}: an unpublished hash answers as one never existed`);
    }
  }
  /* control: the published pin answers otherwise on each */
  assert.equal(s.w.read("verify", { sha256: s.pin }).published, true);
  assert.equal((await worker(s, "publishedbytes", { sha256: s.pin })).status, 200);
  assert.equal(JSON.parse((await worker(s, "publishedcase", { sha256: s.pin })).body).ok, true);
});

/* R11: every place a pair can sit in a served answer. A `strength` (or any strength-named key) is allowed only on a
   finding's row (it names the finding), inside `strengthByCase` (each case edition's reading of one finding, named by
   the finding's row above it), or as a cited leg's own `capture`/`connection` grades; never on an object that is the
   case or an edition of it. Every pair is per axis. */
const CASE_LEVEL = (o) => !Object.hasOwn(o, "bundle_id") && !Object.hasOwn(o, "target") && !Object.hasOwn(o, "to")
  && (Object.hasOwn(o, "caseId") || Object.hasOwn(o, "case_id") || Object.hasOwn(o, "case") || Object.hasOwn(o, "scope")
      || Object.hasOwn(o, "manifest_sha") || Object.hasOwn(o, "edition"));
function noCaseStrength(node, where, path = "$", inByCase = false) {
  if (Array.isArray(node)) { node.forEach((v, i) => noCaseStrength(v, where, `${path}[${i}]`, inByCase)); return; }
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (/strength/i.test(k) && k !== "strengthByCase" && k !== "strengthUndetermined") {
      assert.ok(inByCase || !CASE_LEVEL(node), `${where}: ${path}.${k} sits on a case-level object`);
      if (v !== null && k !== "required_strength" && k !== "required")
        assert.ok(Array.isArray(v) && v.every((s) => s && typeof s.axis === "string"),
          `${where}: ${path}.${k} is not a per-axis pair: ${JSON.stringify(v).slice(0, 200)}`);
    }
    noCaseStrength(v, where, `${path}.${k}`, inByCase || k === "strengthByCase");
  }
}

test("R11 no answer, document or row this module serves composes a case-level strength: every answer that can carry a pair, walked whole (store ops, the Worker's publishedcase, a /6 case file's manifest and every file in it), carries pairs only per member and per axis", async () => {
  const s = publishedSix();
  /* a second case pinning F at another pair, so the manifest's per-case pairs are served too */
  s.w.prepare(CASE2, 1, { project: s.proj, roles: [{ target: s.F, version_sha: s.pins[s.F] }],
                          strength: [{ target: s.F, axis: "capture", grade: "D" }] });
  s.w.signCase(CASE2, 1, { project: s.proj, roster: [{ bundle_id: s.F, version_sha: s.pins[s.F], role: "load_bearing" }] });
  const out = await assembleCaseContainer({ env: s.env, stub: stubOf(s.w), storeName: "bio",
    cs: s.w.p.caseEditionState(CASE, 1, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 300));
  const answers = {
    "publishedcase by case": s.w.read("publishedcase", { id: CASE }),
    "publishedcase by finding": s.w.read("publishedcase", { id: s.G }),
    "publishedcase by hash": s.w.read("publishedcase", { sha256: s.pins[s.G] }),
    "publishedcase, the other case": s.w.read("publishedcase", { id: CASE2 }),
    publishedmanifest: s.w.read("publishedmanifest"),
    publishedlist: s.w.read("publishedlist"),
    "publishededitions F": s.w.read("publishededitions", { id: s.F }),
    "publishededitions G": s.w.read("publishededitions", { id: s.G }),
    "verify F": s.w.read("verify", { sha256: s.pins[s.F] }),
    casefilefacts: s.w.read("casefilefacts", { caseId: CASE, edition: 1 }),
    "Worker publishedcase": JSON.parse((await worker(s, "publishedcase", { id: CASE })).body),
  };
  /* controls: the walk sees the pairs it must allow, so it is not vacuous */
  const m = answers.publishedmanifest.published.find((r) => r.bundle_id === s.F);
  assert.equal(m.strengthUndetermined, "CASES_DISAGREE");
  assert.equal(answers["publishedcase by case"].findings.every((f) => Array.isArray(f.strength) && f.strength.length), true);
  for (const [where, a] of Object.entries(answers)) {
    assert.ok(a && a.ok !== false, `${where} answered`);
    noCaseStrength(a, where);
    assert.equal(Object.hasOwn(a, "strength"), false, `${where}: no top-level strength`);
  }
  /* the case file: its manifest, and every JSON file it carries, read back from each part as a stranger reads it */
  const manifest = JSON.parse((await worker(s, "publishedbytes", { sha256: out.manifest_sha })).body);
  noCaseStrength(manifest, "the case file's manifest");
  assert.equal(Object.hasOwn(manifest, "strength"), false);
  let seen = 0;
  for (const p of manifest.parts) {
    const r = await publishedRoutes({ op: "publishedbytes", env: s.env, stub: stubOf(s.w),
      url: new URL(`https://plane/?op=publishedbytes&sha256=${out.manifest_sha}&format=zip&part=${p.index}`) });
    assert.equal(r.status, 200);
    const zip = new Uint8Array(await r.arrayBuffer());
    const c = readContainer(zip);
    for (const { name } of c.entries) {
      if (!name.endsWith(".json")) continue;
      const text = new TextDecoder().decode((await readPart(zip, c, name)).bytes);
      noCaseStrength(JSON.parse(text), `case file ${name}`);
      seen++;
    }
  }
  assert.ok(seen > 1, "the case file's JSON files were walked");
  /* negative control: a case-level pair is found by the walk */
  assert.throws(() => noCaseStrength({ caseId: CASE, edition: 1, strength: [{ axis: "capture", grade: "A" }] }, "control"));
  assert.throws(() => noCaseStrength({ cases: [{ case_id: CASE, edition: 1, case_strength: "B" }] }, "control"));
});
