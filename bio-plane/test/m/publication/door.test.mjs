/* publication — the door's half of `op=caseflags` (R6) and `op=casedocument` (R1, R29), moved from `src/index.mjs`
   (`door.mjs`, the legacy-index map's §4.4 move, K649 (7)). The door's helpers are handed in as `control-plane` R23 and
   R25 state them; the store is this module's own op map over a real world, in the envelope the plane reads; the
   reader's resolution is the door's (a stand-in answering the viewer the door would stamp). Driven at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { planeWorld as world, V, SIG } from "./fixture.mjs";
import { publicationOps } from "../../../src/publication/index.mjs";
import { caseTensionsOf, caseTensionsOps } from "../../../src/case-tensions/index.mjs";
import { publicationDoorOp, PUBLICATION_DOOR_OPS } from "../../../src/publication/door.mjs";
import { NS_RATIFY, caseRatifyStatement } from "../../../src/sshsig.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
async function doAnswer(res) {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string" && UUID.test(out.correlation)
    ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
}
const storeRefusal = (out) => json(out.reply.body, out.reply.status);
const storeSilent = (op, correlation = undefined) =>
  json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op, detail: "the store did not answer", correlation }, 502);
const sha256Hex = async (v) => createHash("sha256").update(String(v)).digest("hex");

/* The record store's Durable Object: the plane's op map over the world (case-tensions' ops spread beside this module's,
   as the plane's since T33-90, N597); every request it saw is kept. */
function stubOf(w) {
  const seen = [];
  return { seen, async fetch(req, init) {
    const r = typeof req === "string" ? new Request(req, init) : req;
    const url = new URL(r.url);
    seen.push(url);
    const ops = { ...caseTensionsOps(caseTensionsOf(w.host), url, null), ...publicationOps(w.p, url, null) };
    const op = url.pathname.slice(1);
    if (!ops[op]) return Response.json({ ok: false, error: `unknown op: ${op}` }, { status: 400 });
    return Response.json({ ok: true, result: await ops[op]() });
  } };
}
/* The door: `viewer` is what its reader resolution stamps from the presented credential (null: the reader is silent). */
async function door(op, q, stub, { viewer = "", silent = false } = {}) {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  let asked = 0;
  const readerOf = async () => { asked++; return silent ? { silent: "session", correlation: undefined } : { viewer }; };
  const r = await publicationDoorOp(op, url, stub, { json, storeSilent, storeRefusal, doAnswer, sha256Hex, NS_RATIFY,
                                                    caseRatifyStatement, readerOf });
  return r ? { status: r.status, body: await r.json(), asked } : null;
}
const replying = (res) => ({ async fetch() { return res(); } });

const F = "INQ-2026-0001";
function prepared() {
  const w = world();
  w.member("olive"); w.member("bo");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  return { w, proj, pin };
}

test("R6 the door's caseflags forwards only case, target, outstanding and limit, and answers the store's read wrapped as `result`, asking no reader", async () => {
  const { w, proj, pin } = prepared();
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  w.inquiry(F, { question: "Revised?" });
  const stub = stubOf(w);
  const r = await door("caseflags", { case: " CASE-2026-0001 ", target: F, outstanding: "1", limit: 3, viewer: "member:x", junk: 1 }, stub);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true, result: w.p.caseFlags({ caseId: "CASE-2026-0001", target: F, outstandingOnly: true, limit: 3 }) });
  assert.equal(r.body.result.flags.length, 1);
  assert.deepEqual([...stub.seen[0].searchParams.keys()].sort(), ["case", "limit", "outstanding", "target"]);
  assert.equal(r.asked, 0, "every fact in the answer is already public: no reader is resolved");
  const all = await door("caseflags", {}, stubOf(w));
  assert.deepEqual(all.body.result, w.p.caseFlags({}));
  assert.equal((await door("caseflags", { outstanding: "yes" }, stubOf(w))).body.result.outstanding, 1);
});

test("R1 R6 the door relays the store's refusal with its status and sentence, and a reply that is no answer as STORE_DID_NOT_ANSWER, with its correlation id", async () => {
  const refused = () => Response.json({ ok: false, reason: "BAD_JSON", detail: "no" }, { status: 400 });
  const corr = "0f0e0d0c-0b0a-4908-8706-050403020100";
  const internal = () => Response.json({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: corr }, { status: 500 });
  for (const [op, q] of [["caseflags", {}], ["casedocument", { case: "C", edition: 1 }]]) {
    const a = await door(op, q, replying(refused));
    assert.deepEqual([a.status, a.body], [400, { ok: false, reason: "BAD_JSON", detail: "no" }]);
    const b = await door(op, q, replying(internal));
    assert.deepEqual([b.status, b.body.reason, b.body.op, b.body.correlation], [502, "STORE_DID_NOT_ANSWER", op, corr]);
    const c = await door(op, q, replying(() => new Response("not json", { status: 200 })));
    assert.deepEqual([c.status, c.body.reason, "correlation" in c.body], [502, "STORE_DID_NOT_ANSWER", false]);
  }
  assert.equal(await door("verify", {}, replying(refused)), null, "any other op is not this module's: null, the door goes on");
  assert.deepEqual([...PUBLICATION_DOOR_OPS], ["caseflags", "casedocument"]);
});

test("R1 the door's casedocument needs case and edition; the viewer is the door's stamp, never the query's; the answer carries the statement a member signs", async () => {
  const { w, proj } = prepared();
  for (const q of [{}, { case: "CASE-2026-0001" }, { edition: 1 }]) {
    const m = await door("casedocument", q, stubOf(w), { viewer: V("olive") });
    assert.deepEqual([m.status, m.body.reason, m.asked], [400, "MALFORMED", 0]);
    assert.match(m.body.detail, /casedocument requires case=<CASE-YYYY-NNNN> and edition=<n>/);
  }
  /* the owner, stamped by the reader: the unsigned document, and what to sign over its bytes */
  const stub = stubOf(w);
  const own = await door("casedocument", { case: "CASE-2026-0001", edition: 1, viewer: V("bo") }, stub, { viewer: V("olive") });
  assert.equal(own.status, 200);
  const doc = w.p.caseDocument("CASE-2026-0001", 1, V("olive"));
  assert.deepEqual(own.body, { ok: true, ...doc, sign: { namespace: NS_RATIFY,
    statement: new TextDecoder().decode(caseRatifyStatement("CASE-2026-0001", 1, doc.doc_sha)) } });
  assert.equal(stub.seen[0].searchParams.get("viewer"), V("olive"), "the stamp crosses, the caller's `viewer` never does");
  assert.equal(stub.seen[0].searchParams.has("secretSha"), false, "no secret presented: none sent");
  /* a reader that cannot be resolved is a silence, never an answer about the document */
  const quiet = await door("casedocument", { case: "CASE-2026-0001", edition: 1 }, stubOf(w), { silent: true });
  assert.deepEqual([quiet.status, quiet.body.reason, quiet.body.op], [502, "STORE_DID_NOT_ANSWER", "session"]);
  /* signed: anybody reads it, with its signature */
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: w.head(F) }] });
  const any = await door("casedocument", { case: "CASE-2026-0001", edition: 1 }, stubOf(w), { viewer: "" });
  assert.deepEqual([any.status, any.body.ratified, any.body.sig_armored], [200, true, SIG(1)]);
});

test("R29 R1 through the door, an unsigned document answers an outsider at 404 byte for byte as a case never authored", async () => {
  const { w } = prepared();
  const fresh = world();
  for (const viewer of [V("bo"), "", "garbage", "member:"]) {
    const a = await door("casedocument", { case: "CASE-2026-0001", edition: 1 }, stubOf(w), { viewer });
    const b = await door("casedocument", { case: "CASE-2026-0001", edition: 1 }, stubOf(fresh), { viewer });
    assert.deepEqual([a.status, a.body], [404, b.body], `viewer ${viewer}`);
    assert.equal(a.body.reason, "NO_CASE_DOCUMENT");
  }
});

/* The review provider a later module fills (R23): a live grant for one case edition, revocable. */
function granted(w, secret, edition = 1) {
  const grant = { secretSha: createHash("sha256").update(secret).digest("hex"), caseId: "CASE-2026-0001", edition, live: true };
  w.p.registerReviewProvider("review", {
    draftForMember: () => null, draftIdentity: () => null, caseIdentitySentence: () => null, statedEdition: () => null,
    liveGrant: () => null, deadAnswer: () => null,
    grantAdmitsCaseEdition: (s, c, e) => grant.live && s === grant.secretSha && c === grant.caseId && e === grant.edition });
  return grant;
}

test("R1 (reviewcopy's share) a grant secret presented at the door is hashed there and only its fingerprint crosses: a live holder reads the unsigned edition; revoked or bound to another edition, the stranger's bytes", async () => {
  const secret = "the grant's secret";
  const { w } = prepared();
  const grant = granted(w, secret);
  const fresh = world();
  const stranger = (await door("casedocument", { case: "CASE-2026-0001", edition: 1 }, stubOf(fresh), { viewer: "" })).body;
  const stub = stubOf(w);
  const held = await door("casedocument", { case: "CASE-2026-0001", edition: 1, secret }, stub, { viewer: "" });
  assert.deepEqual([held.status, held.body.ok, held.body.ratified], [200, true, false]);
  assert.equal(held.body.text, w.row(`SELECT text FROM case_documents`).text);
  assert.equal(stub.seen[0].searchParams.get("secretSha"), grant.secretSha, "the fingerprint, and never the secret");
  assert.equal(stub.seen[0].toString().includes(encodeURIComponent(secret)), false);
  /* a wrong secret, and an empty one */
  for (const s of ["another secret", ""]) {
    const x = await door("casedocument", { case: "CASE-2026-0001", edition: 1, secret: s }, stubOf(w), { viewer: "" });
    assert.deepEqual([x.status, x.body], [404, stranger], `secret ${JSON.stringify(s)}`);
  }
  /* the edition the grant is bound to only: another edition answers as one never authored */
  w.prepare("CASE-2026-0001", 2, { roles: [{ target: F, version_sha: w.head(F) }] });
  const other = await door("casedocument", { case: "CASE-2026-0001", edition: 2, secret }, stubOf(w), { viewer: "" });
  const other0 = await door("casedocument", { case: "CASE-2026-0001", edition: 2 }, stubOf(fresh), { viewer: "" });
  assert.deepEqual([other.status, other.body], [404, other0.body]);
  /* revoked: the stranger's bytes */
  grant.live = false;
  const dead = await door("casedocument", { case: "CASE-2026-0001", edition: 1, secret }, stubOf(w), { viewer: "" });
  assert.deepEqual([dead.status, dead.body], [404, stranger]);
});
