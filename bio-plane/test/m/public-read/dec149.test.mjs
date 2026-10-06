/* public-read — DEC-149's voice for a reader with no credential (T34-87; K1811, K1821): every public row this module
   answers says "this group's Civicsmith" where it said "this copy", "this copy of the record", "this plane" or "this
   instance". Each changed string is named here and met at the module's interface: the refusal rows through `rowOf` (R17)
   and at the sites that answer them, `publicRead`'s detail (R18), `publishedManifest`'s detail (R4), `publishedCase`'s
   `case_detail` (R3), and the Worker's `publishedbytes` and `publishedcase` sentences (R5). The container manifest's
   `verify` sentence (R6) is asserted beside its deliverer arm (`convert-deliverer.test.mjs`). Negative control: the
   pattern that finds the old voice finds it in the sentences as they were. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket } from "./fixture.mjs";
import { rowOf } from "../../../src/public-read/checks.mjs";
import { bindPublishedPlane, publishedRoutes, publishedObjectMissing } from "../../../src/publication/worker.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const call = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};

const OLD_VOICE = /this copy|this instance|the instance's|this plane/i;
const VOICE = "this group's Civicsmith";
const F = "INQ-2026-0001", CASE = "CASE-2026-0001";

/* CASE-2026-0001 edition 1 over F, ratified and published; F's bytes in the published bucket. */
function published() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  const text = w.text(F);
  w.signFinding(F, { shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }] });
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  return { w, env, pin };
}

/* The rows DEC-149 re-worded (checks.mjs:44–47, :82, :89–91, :103–104, :110–112, :118, :130, :140–142, :151), each
   whole as it now reads. */
const ROWS = {
  NO_PUBLISHED_STORE: "This group's Civicsmith was set up without the storage it keeps its published documents in, so it "
    + "cannot hand over the published document's contents. The document is published; this is a fact about how this "
    + "group's Civicsmith was set up, not about the document or this request, and nothing was changed. Whoever runs this "
    + "group's Civicsmith can connect that storage.",
  NO_PUBLISHED_PART: "Nothing this group's Civicsmith has published matches that fingerprint. Something that was never "
    + "published and something that never existed get this same answer, so it says nothing about anything unpublished. "
    + "Check that the fingerprint was copied whole. Nothing was changed.",
  OBJECT_MISSING: "This document is published, but this group's Civicsmith cannot find its contents in its storage, so it "
    + "cannot hand them over. The document and its fingerprint are unaffected, and nothing was changed. Whoever runs this "
    + "group's Civicsmith can restore the missing contents.",
  MANIFEST_UNREADABLE: "This case file is published, but this group's Civicsmith cannot read the list of its contents, so "
    + "it cannot put the case file together as one download. Nothing was changed. Whoever runs this group's Civicsmith "
    + "can repair it.",
  PART_MISSING: "This case file is published, but this group's Civicsmith cannot find one of the documents it lists, and "
    + "it will not hand over a case file with a piece missing. The reply names the missing document; the others can still "
    + "be asked for one at a time. Nothing was changed. Whoever runs this group's Civicsmith can restore it.",
  DUPLICATE_PATH: "The list of this case file's contents puts two documents under the same name, so one download could be "
    + "read two ways. This group's Civicsmith will not hand over a case file that says two things about one name. Each "
    + "document can still be asked for on its own. Nothing was changed.",
  NOT_PUBLISHED: "Nothing this group's Civicsmith has published answers to what you asked for. A case that was never "
    + "published, an edition that does not exist and a name that never existed all get this same answer, so it says "
    + "nothing about anything unpublished. Nothing was changed.",
  CASE_DOCUMENT_UNSERVABLE: "This case document is published and signed, but this group's Civicsmith could not produce "
    + "its exact contents just now, so it hands over nothing rather than something different. The fingerprint is genuine "
    + "and can still be checked. Nothing was changed. Whoever runs this group's Civicsmith can repair it.",
  /* R17 spells it word for word (K1821) */
  PUBLIC_READ_NOT_REGISTERED: "This group's Civicsmith offers no public read by that name. Nothing was changed.",
};

test("R17 (T34-87, DEC-149) C-68.5, C-98.1, C-98.2, C-98.4, C-98.5, C-98.6, C-98.8, C-98.9 and C-98.10 say \"this group's Civicsmith\", each sentence whole; no row of the table keeps the old voice (negative control: the pattern finds the old sentences)", () => {
  for (const [code, sentence] of Object.entries(ROWS)) {
    assert.equal(rowOf(code).translation, sentence, code);
    assert.ok(sentence.toLowerCase().includes(VOICE.toLowerCase()), code);
  }
  for (const code of [...Object.keys(ROWS), "FINDING_IN_SEVERAL_CASES", "NOT_A_CONTAINER", "CONTAINER_TOO_LARGE",
                      "WITHHELD_BY_COURT_ORDER"])
    assert.doesNotMatch(rowOf(code).translation, OLD_VOICE, code);
  for (const old of ["This copy of the record offers no public read by that name. Nothing was changed.",
                     "Whoever runs this copy can restore it.", "without this instance's cooperation", "never a verdict this plane reached"])
    assert.match(old, OLD_VOICE, old);
});

test("R17 R3 R5 R18 (T34-87, DEC-149) every refusal carrying a re-worded row answers it at its site: NOT_PUBLISHED at publishedcase, PUBLIC_READ_NOT_REGISTERED with its detail at publicread, NO_PUBLISHED_PART, OBJECT_MISSING and NO_PUBLISHED_STORE at publishedbytes, each detail in the new voice", async () => {
  const { w, env, pin } = published();
  const np = w.read("publishedcase", { id: "CASE-2099-0001" });
  assert.deepEqual([np.reason, np.translation], ["NOT_PUBLISHED", ROWS.NOT_PUBLISHED]);
  const nr = w.read("publicread", { name: "nosuchread" });
  assert.deepEqual([nr.reason, nr.translation], ["PUBLIC_READ_NOT_REGISTERED", ROWS.PUBLIC_READ_NOT_REGISTERED]);
  /* index.mjs:262 */
  assert.equal(nr.detail, `no public read named "nosuchread" is registered on ${VOICE}, so there is nothing to serve under that name`);
  const never = await (await call(w, env, "publishedbytes", { sha256: "e".repeat(64) })).json();
  assert.deepEqual([never.reason, never.translation], ["NO_PUBLISHED_PART", ROWS.NO_PUBLISHED_PART]);
  /* worker.mjs:544–545: no published store bound */
  const noStore = await call(w, {}, "publishedbytes", { sha256: pin });
  assert.equal(noStore.status, 503);
  const ns = await noStore.json();
  assert.deepEqual([ns.reason, ns.translation], ["NO_PUBLISHED_STORE", ROWS.NO_PUBLISHED_STORE]);
  assert.equal(ns.detail, `${VOICE} has no published object store configured, so its published bytes are not servable. `
    + `The hash is genuine and ${VOICE} cannot hand over the bytes.`);
  /* worker.mjs:112: a store bound and no object at the hash */
  assert.equal(publishedObjectMissing().detail,
               `that hash is published, and ${VOICE} holds no bytes for it in its published store, so they cannot be `
               + "handed over. The hash is genuine.");
  env.PUBLISHED.m.delete(`bio/published/${pin}`);
  const om = await (await call(w, env, "publishedbytes", { sha256: pin })).json();
  assert.deepEqual([om.reason, om.translation, om.detail],
                   ["OBJECT_MISSING", ROWS.OBJECT_MISSING, publishedObjectMissing().detail]);
  for (const r of [np, nr, never, ns, om]) assert.doesNotMatch(JSON.stringify(r), OLD_VOICE);
});

test("R3 R4 R5 (T34-87, DEC-149) publishedManifest's detail, publishedCase's case_detail, an unavailable finding body and publishedcase's verification say \"this group's Civicsmith\"", async () => {
  const { w, env, pin } = published();
  /* index.mjs:471 */
  assert.equal(w.read("publishedmanifest", {}).detail,
               "every hash here is verifiable by anyone with ssh-keygen and the doorbell, without the cooperation or "
               + `continued existence of ${VOICE}. Nothing unpublished appears, by construction: this reads the published `
               + "projection and never the working corpus.");
  /* index.mjs:1048 */
  const c = w.read("publishedcase", { id: CASE });
  assert.equal(c.ok, true);
  assert.match(c.case_detail, /the last of these is a DISCLOSURE the reader weighs, never a verdict this group's Civicsmith reached \(DEC-20, DEC-46\)/);
  /* worker.mjs:832 */
  const served = await (await call(w, env, "publishedcase", { id: CASE })).json();
  assert.equal(served.verification.detail,
               "tamper-EVIDENT, not tamper-proof: every part is named by sha256 in the manifest, the manifest answers by "
               + "its own sha256, and EACH FINDING's signature covers that finding's own record sha. Nothing here prevents "
               + `a modified copy; everything here makes one detectable by anyone holding it, without the cooperation of ${VOICE}.`);
  /* worker.mjs:753: the body stated unavailable */
  env.PUBLISHED.m.delete(`bio/published/${pin}`);
  const body = (await (await call(w, env, "publishedcase", { id: CASE })).json()).findings[0].body;
  assert.equal(body.state, "unavailable");
  assert.equal(body.detail, `${VOICE} cannot hand over the bytes of that edition, so its conclusion is not rendered here. `
    + "It is NOT read from the working record instead: the frozen strength and the rendered body must come from the same bytes.");
  assert.equal(body.translation, ROWS.OBJECT_MISSING);
  for (const r of [w.read("publishedmanifest", {}).detail, c.case_detail, served.verification.detail, body.detail])
    assert.doesNotMatch(r, OLD_VOICE);
});
