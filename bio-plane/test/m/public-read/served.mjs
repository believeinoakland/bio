/* public-read — every answer this module serves, gathered once, for the tests that hold a rule over every sentence a
   reader meets (DEC-149's voice, K899's word; T47-29, N954). Each entry is `[where, answer]`, the answer as served: the
   store's ops (R1–R4, R18, R21, R25, R30), the Worker's `publishedcase` and `publishedbytes` (R3, R5, R28) with every
   refusal it can answer, the door's own ops and refusals, the in-band quartet and the two packagings (R6, R7: a
   `/6` edition's case file manifest, an edition before `/6`'s container manifest), the case file's statement that it
   was not built, and every row of the module's table (R17). Not a test; a helper under this module's tests path. */
import assert from "node:assert/strict";
import { world, stubOf, bucket, SIG } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { publicReadDoorOp } from "../../../src/public-read/door.mjs";
import { CASE_RESOLUTION_CHECKS, PUBLISHED_STORE_CHECKS, PUBLISHED_READ_CHECKS, rowOf } from "../../../src/public-read/checks.mjs";
import { buildCaseFile } from "../../../src/public-read/casefile.mjs";
import { serialiseContainer, containerEntries } from "../../../src/container.mjs";
import { inbandQuartet } from "../../../src/inband.mjs";

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
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op, detail: "the store did not answer" }, 502);
// fixtures-contract: answer-envelope door-helpers
const requiredArgument = (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const HELPERS = { json, requiredArgument, storeSilent, storeRefusal, doAnswer };
export function bindPlane() {
  bindPublishedPlane({ ...HELPERS, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio" });
}

const CASE = "CASE-2026-0001", OLD = "CASE-2026-0002", CASE3 = "CASE-2026-0003";
const F = "INQ-2026-0001", G = "INQ-2026-0002", H = "INQ-2026-0003", DOC = "INFO-2026-0001-minutes";
const NEVER = "e".repeat(64);

async function served(env, w, via, op, q = {}) {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  const r = via === "door" ? await publicReadDoorOp(op, url, env, stubOf(w), HELPERS)
                           : await publishedRoutes({ op, url, env, stub: stubOf(w) });
  const type = r.headers.get("content-type") || "";
  return { status: r.status, body: type.includes("json") ? await r.json() : `<${type} bytes>` };
}

/** Every answer, `[[where, answer], …]`. */
export async function everyAnswer() {
  bindPlane();
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  const env = { PUBLISHED: bucket() };
  const put = (id) => env.PUBLISHED.m.set(`bio/published/${w.head(id)}`, new TextEncoder().encode(w.text(id)));
  /* CASE: a /6 edition over F, its case file assembled */
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pinF = w.head(F);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pinF }],
                       strength: [{ target: F, axis: "capture", grade: "B" }] });
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pinF, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(F, { edges: [{ to: DOC, kind: "cites", disclosure: "serve" }] }).ok, true);
  put(F);
  const file = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio",
    cs: w.p.caseEditionState(CASE, 1, "parks-group"), via: "test" });
  assert.match(String(file.manifest_sha), /^[0-9a-f]{64}$/, JSON.stringify(file).slice(0, 300));
  /* OLD: an edition before /6 over G, packaged as the container */
  w.inquiry(G);
  const pinG = w.head(G);
  w.prepare(OLD, 1, { format: "bio-case-document/5", project: proj, roles: [{ target: G, version_sha: pinG }] });
  assert.equal(w.signCase(OLD, 1, { project: proj, roster: [{ bundle_id: G, version_sha: pinG, role: "load_bearing" }] }).ok, true);
  assert.equal(w.signFinding(G).ok, true);
  put(G);
  const container = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio",
    cs: w.p.caseEditionState(OLD, 1, "parks-group"), via: "test" });
  assert.match(String(container.manifest_sha), /^[0-9a-f]{64}$/, JSON.stringify(container).slice(0, 300));
  /* CASE3 pins F too, so a finding in several cases is refused by name; DOC published as a loose record */
  w.prepare(CASE3, 1, { project: proj, roles: [{ target: F, version_sha: pinF }] });
  w.signCase(CASE3, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pinF }] });
  w.signFinding(DOC, { sig: SIG(7) });
  /* H: published and its bytes absent from the bucket (OBJECT_MISSING; an unavailable body) */
  w.inquiry(H);
  assert.equal(w.signFinding(H).ok, true);
  const docSha = w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, CASE).doc_sha;
  const out = [];
  const add = (where, a) => out.push([where, a]);
  const store = (op, q = {}) => add(`store ${op} ${JSON.stringify(q)}`, w.read(op, q));
  store("verify", { sha256: pinF }); store("verify", { sha256: NEVER });
  for (const q of [{ id: CASE }, { id: OLD }, { id: DOC }, { id: F }, { id: F, caseId: CASE }, { sha256: pinG },
                   { id: "NOPE" }, { sha256: NEVER }, { id: CASE, edition: 9 }]) store("publishedcase", q);
  store("publishedlist"); store("publishedmanifest");
  store("publishededitions", { id: F }); store("publishededitions", { id: DOC }); store("publishededitions", {});
  store("publishedfrozen", { id: F }); store("publishedfrozen", { id: DOC }); store("publishedfrozen", {}); store("publishedfrozen", { id: "NOPE" });
  store("publicread", { name: "nosuchread" });
  add("store docketpublic", await w.read("docketpublic", { case: CASE }));
  add("store docketfeed", await w.read("docketfeed", { case: CASE }));
  store("casefilefacts", { caseId: CASE, edition: 1 }); store("casefilefacts", { caseId: OLD, edition: 1 });
  store("withheld", { sha256: pinF });
  for (const q of [{ id: CASE }, { id: OLD }, { id: DOC }, { id: F }, { id: "NOPE" }, {}, { id: H }])
    add(`Worker publishedcase ${JSON.stringify(q)}`, await served(env, w, "worker", "publishedcase", q));
  for (const q of [{ sha256: pinF }, { sha256: NEVER }, { sha256: "xyz" }, { sha256: pinF, format: "zip" },
                   { sha256: file.manifest_sha }, { sha256: file.manifest_sha, format: "zip", part: 9 },
                   { sha256: container.manifest_sha }, { sha256: w.head(H) }, { sha256: docSha }])
    add(`Worker publishedbytes ${JSON.stringify(q)}`, await served(env, w, "worker", "publishedbytes", q));
  add("Worker publishedbytes, no store", await served({}, w, "worker", "publishedbytes", { sha256: pinF }));
  for (const [op, q] of [["verify", {}], ["verify", { sha256: pinF }], ["publishedmanifest", {}], ["credit", {}],
                         ["publicread", { name: "Bad Name" }], ["publicread", { name: "nosuchread" }],
                         ["docketpublic", {}], ["docketpublic", { case: "NOPE" }], ["docketfeed", { case: "NOPE" }]])
    add(`door ${op} ${JSON.stringify(q)}`, await served(env, w, "door", op, q));
  /* the packagings, read back as served */
  add("the case file's manifest", (await served(env, w, "worker", "publishedbytes", { sha256: file.manifest_sha })).body);
  add("the case file's assembly", file);
  add("the container's assembly", container);
  /* the container's manifest is served as bytes; read it as a stranger reads it */
  const raw = env.PUBLISHED.m.get(`bio/published/${container.manifest_sha}`);
  add("the container's manifest", JSON.parse(new TextDecoder().decode(raw)));
  /* the refusals the pure halves answer, met at their interface */
  add("a case file not built", await buildCaseFile({ facts: { document: { text: "x", doc_sha: NEVER }, findings: [],
    materials: [], attestations: [] }, read: async () => null }));
  add("a duplicate path", serialiseContainer([{ name: "a", bytes: new Uint8Array(1) }, { name: "a", bytes: new Uint8Array(1) }]));
  add("a container too large", serialiseContainer([{ name: "a", bytes: new Uint8Array(10) }], { maxBytes: 1 }));
  add("a part missing", await containerEntries({ parts: [{ path: "p", sha256: NEVER }] }, new Uint8Array(0), async () => null));
  add("the in-band quartet, no bar", (await inbandQuartet({ subject: {}, over: "x" })).quartet);
  add("the in-band quartet, a bar", (await inbandQuartet({ subject: {}, over: "x",
    bar: { declared: true, capture: "B", connection: null } })).quartet);
  /* a court order withholding the whole of CASE */
  w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 3 }, effect: "remove" });
  store("publishedcase", { id: CASE });
  add("Worker publishedbytes withheld", await served(env, w, "worker", "publishedbytes", { sha256: pinF }));
  add("Worker publishedcase withheld", await served(env, w, "worker", "publishedcase", { id: CASE }));
  /* every row of the table */
  for (const code of Object.keys({ ...CASE_RESOLUTION_CHECKS, ...PUBLISHED_STORE_CHECKS, ...PUBLISHED_READ_CHECKS }))
    add(`row ${code}`, rowOf(code));
  return out;
}

/** Every string in an answer that reads as a sentence (it holds a space), with its path; the signed and captured bytes a
 *  member wrote, served as signed (`text`, a case document's own text, a feed), are not this module's words. */
export function sentences(node, path = "", out = []) {
  if (typeof node === "string") {
    /* a JSON value served as a string (a stored manifest) is data: its own strings are walked */
    if (/^\s*[{[]/.test(node)) { try { return sentences(JSON.parse(node), path, out); } catch { /* prose */ } }
    if (/\s/.test(node)) out.push([path, node]);
    return out;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => sentences(v, `${path}[${i}]`, out)); return out; }
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) {
    if (k === "text" || k === "feed" || k === "sig_armored" || k === "armored") continue;
    sentences(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}
