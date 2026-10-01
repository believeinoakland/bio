/* public-read — K899 (1), Bob's ruling: text a member reads says "record" where it said "bundle"; identifiers stay
   (`bundle_id`, `bundle_sha`, `bundle.md`, the tables, the codes, the kinds, every field name). Driven at the module's
   interface: the Worker's `op=publishedcase` (R3), its argument refusal and its verification sentence, and the store
   side's answers (R1–R4) over a published case, a loose edition and the refusals. Every human sentence in them is read,
   and none holds the word outside an identifier. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, SIG } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const call = async (w, env, op, q = {}) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};

const F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
/* The word, outside an identifier: `bundle_id`, `bundle_sha`, `bundle.md`, `published_bundles`, `to_bundle`, ... and
   the kind value "bundle" are identifiers; a sentence's "bundle" or "bundles" is not. */
const IDENT = /[\w.`]*bundles?[\w.`]*/gi;
const wordOutsideIdentifiers = (s) => (String(s).match(IDENT) || []).filter((m) => /^bundles?$/i.test(m));
/* Every string value in an answer that reads as a sentence (holds a space), wherever it sits, with its path. */
function sentences(node, path = "", out = []) {
  if (typeof node === "string") { if (/\s/.test(node)) out.push([path, node]); return out; }
  if (Array.isArray(node)) { node.forEach((v, i) => sentences(v, `${path}[${i}]`, out)); return out; }
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) {
    /* the signed bytes are the member's own text, served as signed; they are not this module's words */
    if (k === "text" || k === "document" || k === "manifest") continue;
    sentences(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}
const noWord = (answer, label) => {
  const hits = sentences(answer).filter(([, s]) => wordOutsideIdentifiers(s).length);
  assert.deepEqual(hits, [], `${label}: a sentence a member reads says "bundle"`);
};

function published() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.doc(DOC);
  w.inquiry(F, { legs: [{ target: DOC }] });
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  assert.equal(w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }] }).ok, true);
  const text = w.text(F);
  assert.equal(w.signFinding(F, { shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }] }).ok, true);
  assert.equal(w.signFinding(DOC, { sig: SIG(7) }).ok, true);
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  env.PUBLISHED.m.set(`bio/published/${w.head(DOC)}`, new TextEncoder().encode(w.text(DOC)));
  return { w, env, pin };
}

test("R3 (K899 (1)) publishedcase's argument refusal asks for a record id or a record sha, its identifiers unchanged", async () => {
  const { w, env } = published();
  const r = await call(w, env, "publishedcase", {});
  assert.equal(r.status, 400);
  const b = await r.json();
  assert.deepEqual([b.reason, b.op, b.argument], ["REQUIRED_ARGUMENT_MISSING", "publishedcase", "id or sha256"]);
  assert.equal(b.shape, "id=<record id> (optional &edition=N) or sha256=<64 lowercase hex>");
  assert.equal(b.error, "publishedcase requires id=<record id> (with an optional &edition=N, latest by default) or "
                      + "sha256=<the record sha of an edition>");
  noWord(b, "the argument refusal");
});

test("R3 (K899 (1)) the Worker's published case says each finding's signature covers its own record sha, and no sentence it serves says bundle", async () => {
  const { w, env, pin } = published();
  const c = await (await call(w, env, "publishedcase", { id: "CASE-2026-0001" })).json();
  assert.equal(c.ok, true);
  assert.match(c.verification.detail, /EACH FINDING's signature covers that finding's own record sha\./);
  /* the identifiers are unchanged */
  assert.deepEqual([c.findings[0].bundle_id, c.findings[0].bundle_sha, c.verification.findings[0].bundle_id], [F, pin, F]);
  noWord(c, "the published case");
  const loose = await (await call(w, env, "publishedcase", { id: DOC })).json();
  assert.deepEqual([loose.ok, loose.caseId], [true, null]);
  noWord(loose, "a loose edition");
});

test("R1 R2 R3 R4 (K899 (1)) the store side's answers and refusals say no bundle in any sentence", () => {
  const { w, pin } = published();
  for (const [op, q] of [["publishedcase", { id: "CASE-2026-0001" }], ["publishedcase", { id: DOC }],
                         ["publishedcase", { id: "NOPE" }], ["publishedcase", { sha256: pin }], ["verify", { sha256: pin }],
                         ["publishedlist", {}], ["publishededitions", { id: F }], ["publishededitions", {}],
                         ["publishedmanifest", {}]])
    noWord(w.read(op, q), `${op} ${JSON.stringify(q)}`);
});
